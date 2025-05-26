import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds between API calls to avoid rate limiting
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Polyfill fetch for older Node.js versions
let fetch;
try {
  // Try to use built-in fetch (Node 18+)
  fetch = global.fetch;
  if (!fetch) {
    // Fallback to dynamic import of node-fetch
    const { default: nodeFetch } = await import('node-fetch');
    fetch = nodeFetch;
  }
} catch (error) {
  console.error('❌ Fetch not available. Please install node-fetch or use Node.js 18+');
  process.exit(1);
}

// Generate illustration using OpenAI DALL-E
async function generateIllustration(description) {
  if (!OPENAI_API_KEY) {
    console.log('No OpenAI API key found, using placeholder image');
    const seed = encodeURIComponent(description.substring(0, 20));
    return `https://picsum.photos/seed/${seed}/600/400`;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Create a child-friendly, colorful illustration: ${description}. Style: cartoon, safe for children, bright colors, no scary elements.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid'
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error('Error generating image with OpenAI:', error);
    // Fallback to placeholder
    const seed = encodeURIComponent(description.substring(0, 20));
    return `https://picsum.photos/seed/${seed}/600/400`;
  }
}

// Save image to local filesystem
async function saveImageToCache(imageUrl, bookTitle, pageIndex) {
  try {
    console.log(`  Downloading image from: ${imageUrl}`);
    
    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }

    // For node-fetch, we need to handle the response differently
    let buffer;
    if (response.buffer) {
      // node-fetch
      buffer = await response.buffer();
    } else {
      // Built-in fetch
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    // Create cache directory if it doesn't exist
    const cacheDir = path.join(process.cwd(), 'public', 'illustrations');
    try {
      await fs.access(cacheDir);
    } catch {
      await fs.mkdir(cacheDir, { recursive: true });
      console.log(`Created cache directory: ${cacheDir}`);
    }

    // Generate safe filename
    const safeBookTitle = bookTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const filename = `${safeBookTitle}-page-${pageIndex}.jpg`;
    const filePath = path.join(cacheDir, filename);

    // Save the file
    await fs.writeFile(filePath, buffer);
    const localUrl = `/illustrations/${filename}`;
    
    console.log(`  ✓ Saved to: ${localUrl}`);
    return localUrl;
  } catch (error) {
    console.error(`  ✗ Failed to save image:`, error);
    return null;
  }
}

// Check if illustration already exists
async function illustrationExists(bookTitle, pageIndex) {
  const safeBookTitle = bookTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const filename = `${safeBookTitle}-page-${pageIndex}.jpg`;
  const filePath = path.join(process.cwd(), 'public', 'illustrations', filename);
  
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Main function to cache all illustrations
async function cacheAllIllustrations() {
  try {
    console.log('🎨 Starting illustration caching process...\n');

    // Read the children's books JSON
    const jsonPath = path.join(process.cwd(), 'public', 'assets', 'children_books.json');
    const jsonContent = await fs.readFile(jsonPath, 'utf8');
    const books = JSON.parse(jsonContent);

    console.log(`📚 Found ${books.length} books to process\n`);

    let totalPages = 0;
    let generatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process each book
    for (let bookIndex = 0; bookIndex < books.length; bookIndex++) {
      const book = books[bookIndex];
      console.log(`📖 Processing book ${bookIndex + 1}/${books.length}: "${book.title}"`);
      
      // Process each page
      for (let pageIndex = 0; pageIndex < book.pages.length; pageIndex++) {
        const page = book.pages[pageIndex];
        totalPages++;
        
        console.log(`  📄 Page ${pageIndex + 1}/${book.pages.length}: ${page.illustration}`);
        
        // Check if illustration already exists
        const exists = await illustrationExists(book.title, pageIndex);
        if (exists) {
          console.log(`  ⏭️  Already cached, skipping`);
          skippedCount++;
          continue;
        }

        try {
          // Generate illustration
          console.log(`  🎨 Generating illustration...`);
          const imageUrl = await generateIllustration(page.illustration);
          
          // Save to cache
          const localUrl = await saveImageToCache(imageUrl, book.title, pageIndex);
          
          if (localUrl) {
            generatedCount++;
          } else {
            errorCount++;
          }
          
          // Delay between requests to avoid rate limiting
          if (pageIndex < book.pages.length - 1 || bookIndex < books.length - 1) {
            console.log(`  ⏳ Waiting ${DELAY_BETWEEN_REQUESTS/1000}s before next request...`);
            await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
          }
        } catch (error) {
          console.error(`  ✗ Error processing page:`, error);
          errorCount++;
        }
        
        console.log(''); // Empty line for readability
      }
    }

    // Summary
    console.log('📊 Caching Summary:');
    console.log(`   Total pages: ${totalPages}`);
    console.log(`   Generated: ${generatedCount}`);
    console.log(`   Skipped (already cached): ${skippedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log('\n✅ Illustration caching completed!');

  } catch (error) {
    console.error('❌ Fatal error during caching process:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  cacheAllIllustrations().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

export { cacheAllIllustrations }; 
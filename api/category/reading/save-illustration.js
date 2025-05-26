import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { bookTitle, pageIndex, imageUrl } = req.body;
    
    if (!bookTitle || pageIndex === undefined || !imageUrl) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Create cache directory if it doesn't exist
    const cacheDir = path.join(process.cwd(), 'public', 'cached-illustrations');
    try {
      await fs.access(cacheDir);
    } catch {
      await fs.mkdir(cacheDir, { recursive: true });
    }

    // Generate safe filename
    const safeBookTitle = bookTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const filename = `${safeBookTitle}-page-${pageIndex}.jpg`;
    const filePath = path.join(cacheDir, filename);

    // Download and save the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    await fs.writeFile(filePath, buffer);

    // Return the local file path
    const localUrl = `/cached-illustrations/${filename}`;
    
    return res.status(200).json({ 
      success: true, 
      localUrl,
      message: 'Illustration cached successfully' 
    });
  } catch (error) {
    console.error('Cache save error:', error);
    return res.status(500).json({ error: 'Failed to cache illustration' });
  }
} 
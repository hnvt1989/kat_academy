# Illustration Caching Script

This script pre-generates and caches all illustrations for the children's books to improve application performance.

## Features

- 📚 Parses all books from `public/assets/children_books.json`
- 🎨 Generates AI illustrations using OpenAI DALL-E 3 API
- 💾 Saves images to `public/cached-illustrations/` folder
- ⏭️ Skips already cached illustrations
- 🔄 Includes fallback to placeholder images if OpenAI API is unavailable
- ⏱️ Rate limiting to respect API limits
- 📊 Detailed progress reporting

## Usage

### With OpenAI API (Production)

1. Set your OpenAI API key:
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```

2. Run the caching script:
   ```bash
   npm run cache-illustrations
   ```

### Without OpenAI API (Development)

Simply run the script without setting the API key:
```bash
npm run cache-illustrations
```

The script will use placeholder images from Picsum Photos.

## Output

The script will:
- Create `public/cached-illustrations/` directory if it doesn't exist
- Generate files named like: `mollys-magic-garden-page-0.jpg`
- Display progress for each book and page
- Show a summary report at the end

## Rate Limiting

The script includes a 2-second delay between API requests to respect OpenAI's rate limits and avoid errors.

## File Structure

After running, your directory will look like:
```
public/
├── cached-illustrations/
│   ├── mollys-magic-garden-page-0.jpg
│   ├── mollys-magic-garden-page-1.jpg
│   ├── mollys-magic-garden-page-2.jpg
│   ├── olivers-ocean-adventure-page-0.jpg
│   └── ...
└── assets/
    └── children_books.json
```

## Integration

The cached images are automatically used by the Reading page component when available, providing instant loading without API calls. 
import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { bookTitle, pageIndex } = req.query;
    
    if (!bookTitle || pageIndex === undefined) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Generate safe filename
    const safeBookTitle = bookTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const filename = `${safeBookTitle}-page-${pageIndex}.jpg`;
    const filePath = path.join(process.cwd(), 'public', 'cached-illustrations', filename);

    // Check if file exists
    try {
      await fs.access(filePath);
      const localUrl = `/cached-illustrations/${filename}`;
      
      return res.status(200).json({ 
        exists: true, 
        localUrl,
        message: 'Cached illustration found' 
      });
    } catch {
      return res.status(200).json({ 
        exists: false, 
        message: 'No cached illustration found' 
      });
    }
  } catch (error) {
    console.error('Cache check error:', error);
    return res.status(500).json({ error: 'Failed to check cache' });
  }
} 
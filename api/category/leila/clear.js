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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const memoryPath = path.join(process.cwd(), 'leila_chatbot', 'memory.json');
    await fs.writeFile(memoryPath, '[]');
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Clear memory error:', error);
    return res.status(500).json({ error: 'Could not clear chat history' });
  }
}

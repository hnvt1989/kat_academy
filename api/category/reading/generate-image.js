import OpenAI from 'openai';

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
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'No illustration description provided' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const openai = new OpenAI({
      apiKey: apiKey
    });

    // Create a child-friendly prompt for illustration
    const prompt = `Children's book illustration: ${description}. Cute, colorful, safe for children, cartoon style, bright and cheerful, simple and clear, high quality digital art.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid"
    });

    const imageUrl = response.data[0].url;

    return res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Image generation error:', error);
    return res.status(500).json({ error: 'Failed to generate illustration. Please try again.' });
  }
} 
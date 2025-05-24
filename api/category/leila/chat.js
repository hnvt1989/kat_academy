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
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'No message provided' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const openai = new OpenAI({
      apiKey: apiKey
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: 'system', 
          content: 'You are Leila, an energetic sheep who loves to chat with children ages 6-7. Keep your replies short, fun, and easy to understand. Use simple words and short sentences. Be encouraging and positive. Ask questions to keep the conversation going. Never use emojis or symbols in your responses.'
        },
        {
          role: 'user', 
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 60,
    });

    const reply = response.choices[0].message.content;

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Sorry, something went wrong. Please try again.' });
  }
} 
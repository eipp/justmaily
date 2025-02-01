import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt in request body.' });
    }
    // Simulate AI content generation 
    const generatedContent = `This is the AI generated content for: "${prompt}"`;
    return res.status(200).json({ generatedContent });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
} 
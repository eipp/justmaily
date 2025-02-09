import { NextApiRequest, NextApiResponse } from 'next';

function validateRequest(req: NextApiRequest): string {
  if (req.method !== 'POST') throw new Error('Method Not Allowed');
  const { prompt } = req.body;
  if (!prompt) throw new Error('Missing prompt in request body.');
  return prompt;
}

function generateContent(prompt: string): string {
  // Simulate AI content generation
  return `This is the AI generated content for: "${prompt}"`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prompt = validateRequest(req);
    const generatedContent = generateContent(prompt);
    return res.status(200).json({ generatedContent });
  } catch (error: any) {
    if (error.message === 'Method Not Allowed') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: error.message });
    } else if (error.message === 'Missing prompt in request body.') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error.' });
  }
} 
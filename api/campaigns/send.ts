import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
  const { campaignId } = req.body;
  if (!campaignId) {
    return res.status(400).json({ error: 'Missing campaignId in request body.' });
  }
  // Simulate sending process (in production, call actual email service API)
  console.log(`Sending campaign with ID: ${campaignId}`);
  return res.status(200).json({ message: `Campaign ${campaignId} sent successfully.` });
} 
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { campaignId } = req.body;
  if (!campaignId) {
    return res.status(400).json({ error: 'Missing campaignId in request body.' });
  }

  try {
    // Simulate attachment generation (e.g., PDF file)
    const attachmentUrl = `https://cdn.example.com/attachments/${campaignId}.pdf`;
    return res.status(200).json({ campaignId, attachmentUrl, message: 'Attachment generated successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
} 
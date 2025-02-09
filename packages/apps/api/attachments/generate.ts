import type { NextApiRequest, NextApiResponse } from 'next';

function validateRequest(req: NextApiRequest): string {
  if (req.method !== 'POST') throw new Error('Method Not Allowed');
  const { campaignId } = req.body;
  if (!campaignId) throw new Error('Missing campaignId in request body.');
  return campaignId;
}

async function generateAttachment(campaignId: string): Promise<{ attachmentUrl: string }> {
  // Simulate attachment generation (e.g., PDF file)
  const attachmentUrl = `https://cdn.example.com/attachments/${campaignId}.pdf`;
  return { attachmentUrl };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const campaignId = validateRequest(req);
    const result = await generateAttachment(campaignId);
    return res.status(200).json({ campaignId, ...result, message: 'Attachment generated successfully.' });
  } catch (error: any) {
    if (error.message === 'Method Not Allowed') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: error.message });
    } else if (error.message === 'Missing campaignId in request body.') {
      return res.status(400).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
} 
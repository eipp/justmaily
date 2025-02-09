import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../libs/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Helper to validate POST request for campaign creation
function validatePostCampaignRequest(req: NextApiRequest): { title: string; subject: string; content: string } {
  const { title, subject, content } = req.body;
  if (!title || !subject || !content) throw new Error('Missing required campaign fields');
  return { title, subject, content };
}

// Helper to handle GET campaigns
async function getCampaigns() {
  const { data, error } = await supabase.from('campaigns').select('*');
  if (error) throw error;
  return data;
}

// Helper to handle POST campaign creation
async function createCampaign({ title, subject, content }: { title: string; subject: string; content: string; }) {
  const newCampaign = {
    id: uuidv4(),
    title,
    subject,
    content,
    createdAt: Date.now()
  };
  const { data, error } = await supabase.from('campaigns').insert(newCampaign).select();
  if (error) throw error;
  return data[0];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const campaigns = await getCampaigns();
      return res.status(200).json({ campaigns });
    } else if (req.method === 'POST') {
      const { title, subject, content } = validatePostCampaignRequest(req);
      const campaign = await createCampaign({ title, subject, content });
      return res.status(201).json(campaign);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error.' });
  }
} 
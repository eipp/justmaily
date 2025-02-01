import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../libs/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('campaigns').select('*');
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ campaigns: data });
  } else if (req.method === 'POST') {
    const { title, subject, content } = req.body;
    if (!title || !subject || !content) {
      return res.status(400).json({ error: 'Missing required campaign fields' });
    }

    const newCampaign = {
      id: uuidv4(),
      title,
      subject,
      content,
      createdAt: Date.now()
    };

    const { data, error } = await supabase.from('campaigns').insert(newCampaign).select();
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json(data[0]);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 
import type { NextApiRequest, NextApiResponse } from 'next';

interface AgentResponse {
  agent: string;
  status: string;
  details: string;
}

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
    // Simulate agent responses
    const contentAgent: AgentResponse = {
      agent: 'Content Agent',
      status: 'success',
      details: `Generated personalized content for campaign ${campaignId}`
    };

    const emailAgent: AgentResponse = {
      agent: 'Email Agent',
      status: 'success',
      details: `Prepared email sendouts for campaign ${campaignId}`
    };

    const analyticsAgent: AgentResponse = {
      agent: 'Analytics Agent',
      status: 'success',
      details: `Aggregated performance data for campaign ${campaignId}`
    };

    const aggregatedResponse = {
      campaignId,
      agents: [contentAgent, emailAgent, analyticsAgent]
    };

    return res.status(200).json(aggregatedResponse);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
} 
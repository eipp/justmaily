import type { NextApiRequest, NextApiResponse } from 'next';

interface AgentResponse {
  agent: string;
  status: string;
  details: string;
}

function validateRequest(req: NextApiRequest): string {
  if (req.method !== 'POST') throw new Error('Method Not Allowed');
  const { campaignId } = req.body;
  if (!campaignId) throw new Error('Missing campaignId in request body.');
  return campaignId;
}

function generateAgentResponses(campaignId: string): { campaignId: string, agents: AgentResponse[] } {
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
  
  return {
    campaignId,
    agents: [contentAgent, emailAgent, analyticsAgent]
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const campaignId = validateRequest(req);
    const aggregatedResponse = generateAgentResponses(campaignId);
    return res.status(200).json(aggregatedResponse);
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
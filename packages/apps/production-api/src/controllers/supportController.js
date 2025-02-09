const express = require('express');
const router = express.Router();
const logger = require('../logger');

router.post('/query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    const response = await getChatbotResponse(query);
    if (shouldEscalate(query)) {
      logger.info(`Escalating query: ${query}`);
      return res.status(200).json({
        data: response,
        escalation: `Tier 2 support ticket created with ID: ${generateTicketId()}`,
      });
    }
    return res.status(200).json({ data: response });
  } catch (error) {
    logger.error(error);
    return res
      .status(500)
      .json({ error: 'Internal Server Error', details: error.message });
  }
});

async function getChatbotResponse(query) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Simulated response to your query: "${query}"`);
    }, 100);
  });
}

function shouldEscalate(query) {
  const keywords = ['error', 'complex', 'failed', 'urgent'];
  return keywords.some((keyword) => query.toLowerCase().includes(keyword));
}

function generateTicketId() {
  return Math.floor(Math.random() * 1000000).toString();
}

module.exports = router;

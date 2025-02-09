const express = require('express');
const router = express.Router();
const logger = require('../logger');

// In-memory storage for bug bounty reports (production would use a persistent database)
const bugReports = [];

// POST /submit - Endpoint to submit a new bug bounty report
router.post('/submit', async (req, res) => {
  try {
    const { title, description, severity, reporterEmail } = req.body;
    if (!title || !description || !severity || !reporterEmail) {
      return res.status(400).json({
        error:
          'Missing required fields: title, description, severity, reporterEmail',
      });
    }

    const allowedSeverities = ['low', 'medium', 'high', 'critical'];
    if (!allowedSeverities.includes(severity.toLowerCase())) {
      return res.status(400).json({
        error: `Severity must be one of: ${allowedSeverities.join(', ')}`,
      });
    }

    // Simulate integration with external bug bounty platform (e.g., HackerOne) and generate a report ID
    const reportId = `BB-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const report = {
      reportId,
      title,
      description,
      severity,
      reporterEmail,
      submittedAt: new Date(),
    };

    bugReports.push(report);
    logger.info(`Bug bounty report submitted: ${reportId}`);
    return res.status(201).json({ data: report });
  } catch (error) {
    logger.error(error);
    return res
      .status(500)
      .json({ error: 'Internal Server Error', details: error.message });
  }
});

// GET /guidelines - Endpoint to retrieve bug bounty program guidelines
router.get('/guidelines', (req, res) => {
  try {
    const guidelines = {
      scope:
        'The scope includes all publicly reachable endpoints, API endpoints, and the web application front-end.',
      rules:
        'Any vulnerabilities related to authentication, authorization, data leakage, XSS, and injection attacks are in scope.',
      safeHarbor:
        'All efforts will be made to minimize impact and protect reporter data.',
      reward:
        'Bounty rewards vary depending on severity and impact according to industry standards.',
      submissionProcess:
        'Submit detailed reports through this endpoint. Our team will review and contact you with follow-up questions if necessary.',
    };
    return res.status(200).json({ data: guidelines });
  } catch (error) {
    logger.error(error);
    return res
      .status(500)
      .json({ error: 'Internal Server Error', details: error.message });
  }
});

// GET /reports - Endpoint to list all submitted bug bounty reports (for admin use; production would require proper authentication)
router.get('/reports', (req, res) => {
  try {
    return res.status(200).json({ data: bugReports });
  } catch (error) {
    logger.error(error);
    return res
      .status(500)
      .json({ error: 'Internal Server Error', details: error.message });
  }
});

module.exports = router;

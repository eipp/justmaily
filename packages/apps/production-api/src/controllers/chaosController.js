const express = require('express');
const router = express.Router();
const { exec } = require('child_process');

/**
 * @route POST /chaos/experiment
 * @desc Triggers a production-grade chaos engineering experiment using a tool such as Gremlin.
 *       This simulates controlled failures and validates system resiliency.
 */
router.post('/experiment', (req, res, next) => {
  try {
    // Execute shell script that integrates with Gremlin's API
    exec('sh ./scripts/chaos_experiment.sh', (error, stdout, stderr) => {
      if (error) {
        return next(new Error(`Chaos experiment failed: ${stderr}`));
      }
      res
        .status(200)
        .json({ message: 'Chaos experiment executed', details: stdout });
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

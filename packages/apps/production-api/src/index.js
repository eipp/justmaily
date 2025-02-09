// production-api/src/index.js
const express = require('express');
const winston = require('winston');

// Import controllers
const testController = require('./controllers/testController');
const performanceController = require('./controllers/performanceController');
const chaosController = require('./controllers/chaosController');
const supportController = require('./controllers/supportController');
const bugBountyController = require('./controllers/bugBountyController');

const app = express();
const port = process.env.PORT || 3000;

// Configure Express to parse JSON requests
app.use(express.json());

// Register routes
app.use('/test', testController);
app.use('/performance', performanceController);
app.use('/chaos', chaosController);
app.use('/support', supportController);
app.use('/bug-bounty', bugBountyController);

// Global error handler for production-grade error management
app.use((err, req, res, next) => {
  winston.error(err.stack);
  res
    .status(500)
    .json({ error: 'Internal Server Error', details: err.message });
});

app.listen(port, () => {
  winston.info(`Server started on port ${port}`);
  console.log(`Server running on port ${port}`);
});

module.exports = app; // Exported for testing

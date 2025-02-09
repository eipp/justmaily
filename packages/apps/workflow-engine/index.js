const http = require('http');

const MAX_RETRIES = 3;

async function taskWithRetries(taskName, taskFn) {
  let attempts = 0;
  while (attempts < MAX_RETRIES) {
    try {
      console.log(`Attempting ${taskName}: attempt ${attempts + 1}`);
      const result = await taskFn();
      console.log(`${taskName} succeeded`);
      return result;
    } catch (error) {
      attempts++;
      console.error(`${taskName} failed on attempt ${attempts}:`, error);
      if (attempts >= MAX_RETRIES) {
        console.error(`Exceeded max retries for ${taskName}`);
        throw error;
      }
      console.log(`Retrying ${taskName}...`);
    }
  }
}

// A sample task function that simulates intermittent failure
async function sampleTask() {
  return new Promise((resolve, reject) => {
    const random = Math.random();
    setTimeout(() => {
      if (random < 0.7) {
        reject(new Error('Simulated task failure'));
      } else {
        resolve('Task completed successfully');
      }
    }, 500);
  });
}

async function runWorkflow() {
  console.log('Starting workflow execution');
  try {
    const result = await taskWithRetries('SampleTask', sampleTask);
    console.log('Workflow completed:', result);
  } catch (error) {
    console.error('Workflow failed after retries:', error);
    // Self-healing: Trigger recovery/alert mechanisms here
  }
}

// Start the workflow asynchronously
runWorkflow();

// Create a simple HTTP server for health checks (useful for container orchestration readiness/liveness).
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Health endpoint running on port ${PORT}`);
});

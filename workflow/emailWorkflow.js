import { proxyActivities } from '@temporalio/workflow';

// Set up activities with retry options
const { sendEmailActivity } = proxyActivities({
  startToCloseTimeout: '5m',
  retry: {
    maximumAttempts: 3,
    initialInterval: '10s',
  },
});

export async function sendEmailWorkflow(emailData) {
  try {
    await sendEmailActivity(emailData);
  } catch (error) {
    // Robust error handling: log, alert, or trigger alternate flows
    throw error;
  }
}

import { CloudWatchClient, PutMetricAlarmCommand, ComparisonOperator } from '@aws-sdk/client-cloudwatch';
import { SESClient, CreateConfigurationSetCommand, CreateTemplateCommand, CreateReceiptRuleSetCommand, CreateReceiptRuleCommand, PutConfigurationSetDeliveryOptionsCommand, UpdateConfigurationSetEventDestinationCommand, VerifyDomainIdentityCommand, VerifyDomainDkimCommand, GetAccountSendingEnabledCommand, GetSendQuotaCommand, CreateConfigurationSetTrackingOptionsCommand, EventType } from '@aws-sdk/client-ses';
import { SNSClient, CreateTopicCommand, SubscribeCommand } from '@aws-sdk/client-sns';
import chalk from 'chalk';
import * as dotenv from 'dotenv';

import { sesProductionConfig } from '../config/ses.production';

// Load environment variables
dotenv.config();

// Initialize AWS clients
const client = new SESClient({
  region: sesProductionConfig.region,
  credentials: {
    accessKeyId: sesProductionConfig.credentials.accessKeyId,
    secretAccessKey: sesProductionConfig.credentials.secretAccessKey
  }
});

const cloudWatchClient = new CloudWatchClient({
  region: sesProductionConfig.region,
  credentials: {
    accessKeyId: sesProductionConfig.credentials.accessKeyId,
    secretAccessKey: sesProductionConfig.credentials.secretAccessKey,
  },
});

const snsClient = new SNSClient({
  region: sesProductionConfig.region,
  credentials: {
    accessKeyId: sesProductionConfig.credentials.accessKeyId,
    secretAccessKey: sesProductionConfig.credentials.secretAccessKey,
  },
});

async function setupSESProduction() {

  try {
    // 1. Verify Account Status
    const sendingEnabled = await client.send(new GetAccountSendingEnabledCommand({}));
    const quotas = await client.send(new GetSendQuotaCommand({}));
    

    // 2. Verify Domain
    const domainVerification = await client.send(new VerifyDomainIdentityCommand({
      Domain: 'justmaily.com'
    }));
    

    // 3. Setup DKIM
    const dkimVerification = await client.send(new VerifyDomainDkimCommand({
      Domain: 'justmaily.com'
    }));
    

    // 4. Create Configuration Set
    try {
      await client.send(new CreateConfigurationSetCommand({
        ConfigurationSet: {
          Name: sesProductionConfig.configurationSet,
        }
      }));
    } catch (error: unknown) {
      if ((error as { name: string }).name === 'ConfigurationSetAlreadyExistsException') {
      } else {
        throw error;
      }
    }

    // 5. Verify Tracking Domain
    try {
      const trackingDomainVerification = await client.send(new VerifyDomainIdentityCommand({
        Domain: sesProductionConfig.trackingDomain
      }));
    } catch (error: unknown) {
      if ((error as { name: string }).name === 'AlreadyExistsException') {
      } else {
        throw error;
      }
    }

    // 6. Configure Tracking Options
    try {
      await client.send(new CreateConfigurationSetTrackingOptionsCommand({
        ConfigurationSetName: sesProductionConfig.configurationSet,
        TrackingOptions: {
          CustomRedirectDomain: sesProductionConfig.trackingDomain
        }
      }));
    } catch (error: unknown) {
      if ((error as { name: string }).name === 'TrackingOptionsAlreadyExistsException') {
      } else {
        throw error;
      }
    }

    // 7. Configure Delivery Options
    await client.send(new PutConfigurationSetDeliveryOptionsCommand({
      ConfigurationSetName: sesProductionConfig.configurationSet,
      DeliveryOptions: {
        TlsPolicy: 'Require'
      }
    }));

    // 8. Create SNS Topics for Events
    const topicArn = await createEventTopic();

    // 9. Configure Event Destinations
    await setupEventDestinations(topicArn);

    // 10. Create CloudWatch Alarms
    await setupCloudWatchAlarms();

    // 11. Create Default Templates
    await createDefaultTemplates();

    // 12. Setup Receipt Rules
    await setupReceiptRules(topicArn);

    dkimVerification.DkimTokens?.forEach((token: string) => {
    });

  } catch (error) {
    console.error(chalk.red('SES Production Setup Failed:'));
    if (error instanceof Error) {
      console.error(chalk.red(`Error Type: ${error.name}`));
      console.error(chalk.red(`Message: ${error.message}`));
      console.error(chalk.red('Stack Trace:'), error.stack);
    } else {
      console.error(chalk.red('Unknown error type:'), error);
    }
    process.exit(1);
  }
}

async function createEventTopic() {
  const topicResponse = await snsClient.send(new CreateTopicCommand({
    Name: 'ses-events-production'
  }));

  if (!topicResponse.TopicArn) {
    throw new Error('Failed to create SNS topic: TopicArn is undefined');
  }

  // Subscribe to the topic
  await snsClient.send(new SubscribeCommand({
    TopicArn: topicResponse.TopicArn,
    Protocol: 'https',
    Endpoint: `${sesProductionConfig.trackingDomain}/webhooks/ses`
  }));

  return topicResponse.TopicArn;
}

async function setupEventDestinations(topicArn: string) {
  const eventTypes: EventType[] = [
    EventType.SEND,
    EventType.BOUNCE,
    EventType.COMPLAINT,
    EventType.DELIVERY,
    EventType.OPEN,
    EventType.CLICK
  ];
  
  await client.send(new UpdateConfigurationSetEventDestinationCommand({
    ConfigurationSetName: sesProductionConfig.configurationSet,
    EventDestination: {
      Name: 'production-events',
      Enabled: true,
      MatchingEventTypes: eventTypes,
      SNSDestination: {
        TopicARN: topicArn
      }
    }
  }));
}

async function setupCloudWatchAlarms() {
  const metrics = [
    {
      name: 'Bounces',
      threshold: sesProductionConfig.alertThresholds.bounceRate,
      comparisonOperator: ComparisonOperator.GreaterThanThreshold
    },
    {
      name: 'Complaints',
      threshold: sesProductionConfig.alertThresholds.complaintRate,
      comparisonOperator: ComparisonOperator.GreaterThanThreshold
    },
    {
      name: 'DeliveryRate',
      threshold: sesProductionConfig.alertThresholds.deliveryRate,
      comparisonOperator: ComparisonOperator.LessThanThreshold
    }
  ];

  for (const metric of metrics) {
    await cloudWatchClient.send(new PutMetricAlarmCommand({
      AlarmName: `SES-${metric.name}-Production`,
      MetricName: metric.name,
      Namespace: sesProductionConfig.metricsNamespace,
      Period: 300,
      EvaluationPeriods: 2,
      Threshold: metric.threshold,
      ComparisonOperator: metric.comparisonOperator,
      Statistic: 'Average',
      ActionsEnabled: true,
      AlarmDescription: `Alert when ${metric.name} exceeds threshold in production`,
      Dimensions: [
        {
          Name: 'ConfigurationSet',
          Value: sesProductionConfig.configurationSet
        }
      ]
    }));
  }
}

async function createDefaultTemplates() {
  const templates = [
    {
      Template: {
        TemplateName: 'DefaultTemplate',
        SubjectPart: '{{subject}}',
        HtmlPart: '{{content}}',
        TextPart: '{{textContent}}'
      }
    },
    {
      Template: {
        TemplateName: 'TransactionalTemplate',
        SubjectPart: '{{subject}}',
        HtmlPart: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px;">
              {{content}}
              <footer style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #666;">
                  This email was sent by JustMaily. If you have any questions, please contact
                  <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>
                </p>
              </footer>
            </body>
          </html>
        `,
        TextPart: '{{textContent}}\n\n---\nThis email was sent by JustMaily. Questions? Contact {{supportEmail}}'
      }
    }
  ];

  for (const template of templates) {
    await client.send(new CreateTemplateCommand(template));
  }
}

async function setupReceiptRules(topicArn: string) {
  // Create rule set
  await client.send(new CreateReceiptRuleSetCommand({
    RuleSetName: 'ProductionRuleSet'
  }));

  // Create rules
  await client.send(new CreateReceiptRuleCommand({
    RuleSetName: 'ProductionRuleSet',
    Rule: {
      Name: 'MainRule',
      Enabled: true,
      TlsPolicy: 'Require',
      ScanEnabled: true,
      Recipients: [`bounce@${sesProductionConfig.trackingDomain}`],
      Actions: [
        {
          SNSAction: {
            TopicArn: topicArn,
            Encoding: 'UTF-8'
          }
        },
        {
          StopAction: {
            Scope: 'RuleSet'
          }
        }
      ]
    }
  }));
}

// Run the setup
setupSESProduction().catch(error => {
  console.error(chalk.red('Setup failed:'), error instanceof Error ? error.message : error);
  process.exit(1);
}); 
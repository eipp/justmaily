# Amazon SES Integration Guide

This guide provides detailed instructions for setting up and using Amazon Simple Email Service (SES) with JustMaily.

## Prerequisites

1. An AWS account with access to SES
2. Domain ownership for `justmaily.com`
3. AWS IAM credentials with appropriate SES permissions
4. Node.js 16+ and npm/yarn installed

## Setup Steps

### 1. AWS Account Configuration

1. Create an IAM user for SES access:
   ```bash
   aws iam create-user --user-name justmaily-ses
   ```

2. Attach required policies:
   ```bash
   aws iam attach-user-policy --user-name justmaily-ses --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess
   aws iam attach-user-policy --user-name justmaily-ses --policy-arn arn:aws:iam::aws:policy/CloudWatchFullAccess
   ```

3. Create access keys:
   ```bash
   aws iam create-access-key --user-name justmaily-ses
   ```

### 2. Domain Verification

1. Verify your domain in SES:
   ```bash
   aws ses verify-domain-identity --domain justmaily.com
   ```

2. Add DNS records for domain verification:
   - TXT record: `_amazonses.justmaily.com`
   - Value: `<verification-token>` (provided by AWS)

3. Configure DKIM:
   ```bash
   aws ses verify-domain-dkim --domain justmaily.com
   ```

4. Add DKIM CNAME records (3 records provided by AWS)

### 3. Configuration Set Setup

1. Create a configuration set:
   ```bash
   aws ses create-configuration-set --configuration-set-name justmaily-production
   ```

2. Enable tracking:
   ```bash
   aws ses update-configuration-set-tracking-options \
     --configuration-set-name justmaily-production \
     --tracking-options CustomRedirectDomain=click.justmaily.com
   ```

3. Configure event publishing:
   ```bash
   aws ses create-configuration-set-event-destination \
     --configuration-set-name justmaily-production \
     --event-destination-name ses-events \
     --event-destination "{ \
         \"CloudWatchDestination\": { \
           \"DimensionConfigurations\": [ \
             {\"DimensionName\": \"ses:source-ip\", \"DimensionValueSource\": \"messageTag\", \"DefaultDimensionValue\": \"none\"} \
           ] \
         }, \
         \"Enabled\": true, \
         \"MatchingEventTypes\": [\"send\", \"bounce\", \"complaint\", \"delivery\", \"open\", \"click\"] \
       }"
   ```

### 4. Environment Configuration

Add the following environment variables to your `.env` file:

```env
# AWS SES Configuration
AWS_SES_ACCESS_KEY_ID=your_access_key_id
AWS_SES_SECRET_ACCESS_KEY=your_secret_access_key
AWS_SES_REGION=us-east-1
AWS_SES_CONFIGURATION_SET=justmaily-production

# SES Settings
SES_MAX_BATCH_SIZE=50
SES_TRACKING_DOMAIN=click.justmaily.com
SES_OPEN_TRACKING_ENABLED=true
SES_CLICK_TRACKING_ENABLED=true

# Monitoring
SES_MONITORING_ENABLED=true
SES_METRICS_NAMESPACE=JustMaily/SES

# Security
SES_WEBHOOK_SECRET=your_webhook_secret
```

## Usage

### Basic Email Sending

```typescript
import { ProviderFactory } from '../services/providers/factory';
import { MetricsService } from '../lib/monitoring';

const factory = new ProviderFactory({
  ses: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
    region: process.env.AWS_SES_REGION,
    configurationSet: process.env.AWS_SES_CONFIGURATION_SET,
    trackingDomain: process.env.SES_TRACKING_DOMAIN,
    maxBatchSize: parseInt(process.env.SES_MAX_BATCH_SIZE),
    openTrackingEnabled: process.env.SES_OPEN_TRACKING_ENABLED === 'true',
    clickTrackingEnabled: process.env.SES_CLICK_TRACKING_ENABLED === 'true'
  }
}, new MetricsService());

// Send a single email
await factory.sendEmail({
  to: 'recipient@example.com',
  from: 'sender@justmaily.com',
  subject: 'Hello from JustMaily',
  content: '<h1>Welcome!</h1><p>This is a test email.</p>'
});

// Send batch emails
await factory.sendBatch([
  {
    to: 'recipient1@example.com',
    subject: 'Hello #1',
    content: 'Content for recipient 1'
  },
  {
    to: 'recipient2@example.com',
    subject: 'Hello #2',
    content: 'Content for recipient 2'
  }
]);
```

### Monitoring and Analytics

```typescript
// Get SES analytics
const analytics = await factory.getProviderAnalytics('ses', {
  start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
  end: new Date()
});

console.log('Delivery Rate:', analytics.deliveryRate);
console.log('Bounce Rate:', analytics.bounceRate);
console.log('Complaint Rate:', analytics.spamRate);
```

## Best Practices

1. **Rate Limiting**
   - SES has a default sending quota of 14 emails per second
   - Use the built-in rate limiting in the provider
   - Implement exponential backoff for retries

2. **Error Handling**
   - Handle bounces and complaints promptly
   - Remove invalid email addresses from your lists
   - Monitor your bounce and complaint rates

3. **Monitoring**
   - Set up CloudWatch alarms for key metrics
   - Monitor sending quotas and reputation
   - Track delivery, open, and click rates

4. **Security**
   - Rotate access keys regularly
   - Use configuration sets for tracking
   - Implement DKIM and SPF
   - Enable HTTPS for tracking domains

5. **Compliance**
   - Include unsubscribe links
   - Honor bounce and complaint feedback
   - Follow email marketing best practices
   - Comply with CAN-SPAM and GDPR

## Troubleshooting

### Common Issues

1. **Domain Verification Failed**
   - Check DNS records are correctly configured
   - Wait for DNS propagation (up to 72 hours)
   - Verify TXT and DKIM records

2. **Sending Quota Exceeded**
   - Request quota increase from AWS
   - Implement rate limiting
   - Use multiple regions if needed

3. **High Bounce Rates**
   - Clean your email lists
   - Implement double opt-in
   - Monitor feedback loops

4. **Tracking Not Working**
   - Verify configuration set setup
   - Check tracking domain DNS
   - Enable tracking options

### Support

For issues or questions:
1. Check AWS SES documentation
2. Review CloudWatch logs
3. Contact AWS Support
4. Open a GitHub issue

## Maintenance

### Regular Tasks

1. **Daily**
   - Monitor bounce and complaint rates
   - Check sending quotas
   - Review error logs

2. **Weekly**
   - Analyze delivery metrics
   - Clean email lists
   - Update documentation

3. **Monthly**
   - Rotate access keys
   - Review security settings
   - Check for AWS updates

4. **Quarterly**
   - Audit email templates
   - Update DNS records
   - Review compliance 
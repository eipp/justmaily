'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o)
            if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.emailMarketingWorkflow = emailMarketingWorkflow;
const wf = __importStar(require('@temporalio/workflow'));
const config_1 = require('../config');
const {
  analyzeAudience,
  generateContent,
  personalizeContent,
  optimizeContent,
  sendEmail,
  trackEngagement,
  analyzeResults,
} = wf.proxyActivities({
  startToCloseTimeout: config_1.config.temporal.activityTimeout,
  retry: {
    maximumAttempts: config_1.config.temporal.retryAttempts,
    initialInterval: config_1.config.temporal.retryInterval,
  },
});
async function emailMarketingWorkflow(campaign) {
  const activities = [];
  const startTime = new Date().toISOString();
  let success = true;
  try {
    // Step 1: Analyze audience
    const audienceResult = await analyzeAudience({
      campaignId: campaign.id,
      audience: campaign.audience,
    });
    activities.push({
      type: 'analyze_audience',
      status: audienceResult.success ? 'completed' : 'failed',
      result: audienceResult,
    });
    // Step 2: Generate content
    const contentResult = await generateContent({
      campaignId: campaign.id,
      template: campaign.template,
      audience: audienceResult.data,
      goal: campaign.goal,
    });
    activities.push({
      type: 'generate_content',
      status: contentResult.success ? 'completed' : 'failed',
      result: contentResult,
    });
    // Step 3: Personalize content (if enabled)
    let finalContent = contentResult.data;
    if (campaign.settings.personalizeContent) {
      const personalizationResult = await personalizeContent({
        campaignId: campaign.id,
        content: contentResult.data,
        audience: audienceResult.data,
      });
      activities.push({
        type: 'personalize_content',
        status: personalizationResult.success ? 'completed' : 'failed',
        result: personalizationResult,
      });
      finalContent = personalizationResult.data;
    }
    // Step 4: Optimize content
    const optimizationResult = await optimizeContent({
      campaignId: campaign.id,
      content: finalContent,
      goal: campaign.goal,
    });
    activities.push({
      type: 'optimize_content',
      status: optimizationResult.success ? 'completed' : 'failed',
      result: optimizationResult,
    });
    // Step 5: Send emails in batches
    const batchSize = config_1.config.batch.size;
    const audience = audienceResult.data.recipients;
    const batches = Math.ceil(audience.length / batchSize);
    for (let i = 0; i < batches; i++) {
      const batchStart = i * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, audience.length);
      const batch = audience.slice(batchStart, batchEnd);
      // Use child workflow for each batch
      const batchResult = await wf.executeChild('sendEmailBatch', {
        workflowId: `${campaign.id}-batch-${i}`,
        args: [
          {
            campaignId: campaign.id,
            content: optimizationResult.data,
            recipients: batch,
            settings: campaign.settings,
          },
        ],
      });
      activities.push({
        type: 'send_email',
        status: batchResult.success ? 'completed' : 'failed',
        result: batchResult,
      });
      // Respect rate limits
      if (i < batches - 1) {
        await wf.sleep(1000); // 1 second between batches
      }
    }
    // Step 6: Track engagement (continuous)
    const engagementSignal = wf.defineSignal('engagement');
    const engagementResults = [];
    // Set up signal handler for engagement updates
    wf.setHandler(engagementSignal, (result) => {
      engagementResults.push(result);
      activities.push({
        type: 'track_engagement',
        status: result.success ? 'completed' : 'failed',
        result,
      });
    });
    // Start tracking engagement
    const trackingResult = await trackEngagement({
      campaignId: campaign.id,
      settings: campaign.settings,
    });
    activities.push({
      type: 'track_engagement',
      status: trackingResult.success ? 'completed' : 'failed',
      result: trackingResult,
    });
    // Step 7: Analyze results
    const analysisResult = await analyzeResults({
      campaignId: campaign.id,
      activities: activities,
      engagementResults,
    });
    activities.push({
      type: 'analyze_results',
      status: analysisResult.success ? 'completed' : 'failed',
      result: analysisResult,
    });
  } catch (error) {
    success = false;
    activities.push({
      type: 'analyze_results',
      status: 'failed',
      result: {
        success: false,
        data: null,
        error: {
          code: 'WORKFLOW_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error,
        },
        metadata: {
          duration: Date.now() - new Date(startTime).getTime(),
          startTime,
          endTime: new Date().toISOString(),
          attempts: 1,
        },
      },
    });
  }
  return {
    success,
    activities,
    metadata: {
      duration: Date.now() - new Date(startTime).getTime(),
      startTime,
      endTime: new Date().toISOString(),
      version: 1,
    },
  };
}

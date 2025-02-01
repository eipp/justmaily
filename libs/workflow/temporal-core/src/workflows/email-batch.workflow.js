"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailBatchWorkflow = sendEmailBatchWorkflow;
const wf = __importStar(require("@temporalio/workflow"));
const config_1 = require("../config");
const { sendEmail } = wf.proxyActivities({
    startToCloseTimeout: config_1.config.temporal.activityTimeout,
    retry: {
        maximumAttempts: config_1.config.temporal.retryAttempts,
        initialInterval: config_1.config.temporal.retryInterval,
    },
});
// Custom rate limiter for workflow
class RateLimiter {
    constructor(maxTokens) {
        this.maxTokens = maxTokens;
        this.tokens = maxTokens;
        this.lastRefillTime = Date.now();
    }
    async acquire() {
        while (this.tokens <= 0) {
            const now = Date.now();
            const timeSinceLastRefill = now - this.lastRefillTime;
            const tokensToAdd = Math.floor(timeSinceLastRefill / 1000); // Refill every second
            if (tokensToAdd > 0) {
                this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
                this.lastRefillTime = now;
            }
            if (this.tokens <= 0) {
                await wf.sleep(100); // Wait 100ms before checking again
            }
        }
        this.tokens--;
    }
    release() {
        this.tokens = Math.min(this.maxTokens, this.tokens + 1);
    }
}
async function sendEmailBatchWorkflow(input) {
    const startTime = new Date().toISOString();
    const results = [];
    try {
        // Process each recipient in parallel with rate limiting
        const rateLimiter = new RateLimiter(config_1.config.rateLimiting.maxActivitiesPerSecond);
        const promises = input.recipients.map(async (recipient) => {
            await rateLimiter.acquire();
            try {
                const result = await sendEmail({
                    campaignId: input.campaignId,
                    recipientId: recipient.id,
                    email: recipient.email,
                    subject: input.content.subject,
                    body: input.content.body,
                    template: input.content.template,
                    metadata: recipient.metadata,
                    settings: input.settings,
                });
                results.push({
                    recipientId: recipient.id,
                    success: true,
                });
                return result;
            }
            catch (error) {
                results.push({
                    recipientId: recipient.id,
                    success: false,
                    error: {
                        code: 'SEND_FAILED',
                        message: error instanceof Error ? error.message : 'Unknown error',
                    },
                });
                throw error;
            }
            finally {
                rateLimiter.release();
            }
        });
        // Wait for all sends to complete
        await Promise.allSettled(promises);
        // Calculate success rate
        const successCount = results.filter((r) => r.success).length;
        const successRate = (successCount / results.length) * 100;
        return {
            success: successRate >= 90, // Consider batch successful if 90% or more emails sent
            data: {
                totalProcessed: results.length,
                successCount,
                failureCount: results.length - successCount,
                successRate,
                results,
            },
            metadata: {
                duration: Date.now() - new Date(startTime).getTime(),
                startTime,
                endTime: new Date().toISOString(),
                attempts: 1,
            },
        };
    }
    catch (error) {
        return {
            success: false,
            data: {
                totalProcessed: results.length,
                successCount: results.filter((r) => r.success).length,
                failureCount: results.filter((r) => !r.success).length,
                successRate: (results.filter((r) => r.success).length / results.length) * 100,
                results,
            },
            error: {
                code: 'BATCH_FAILED',
                message: error instanceof Error ? error.message : 'Unknown error',
                details: error,
            },
            metadata: {
                duration: Date.now() - new Date(startTime).getTime(),
                startTime,
                endTime: new Date().toISOString(),
                attempts: 1,
            },
        };
    }
}

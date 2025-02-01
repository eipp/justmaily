"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
class EmailService {
    constructor(config, metrics) {
        this.config = config;
        this.metrics = metrics;
        this.rateLimitTokens = {
            perSecond: config.rateLimits.maxPerSecond,
            perMinute: config.rateLimits.maxPerMinute,
            perHour: config.rateLimits.maxPerHour
        };
        this.lastRefill = {
            perSecond: Date.now(),
            perMinute: Date.now(),
            perHour: Date.now()
        };
    }
    async send(recipient, content, options) {
        var _a, _b;
        const startTime = Date.now();
        let attempts = 0;
        try {
            // Check rate limits
            await this.checkRateLimits();
            // Prepare email
            const email = {
                from: options.sender || this.config.defaultSender,
                to: recipient,
                replyTo: options.replyTo,
                subject: options.subject,
                html: content,
                template: options.template,
                variables: options.variables,
                attachments: options.attachments,
                trackOpens: (_a = options.trackOpens) !== null && _a !== void 0 ? _a : true,
                trackClicks: (_b = options.trackClicks) !== null && _b !== void 0 ? _b : true,
                metadata: Object.assign(Object.assign({}, options.metadata), { provider: this.config.provider })
            };
            // Send email with retries
            let error;
            while (attempts < this.config.retryOptions.maxAttempts) {
                try {
                    const result = await this.sendWithProvider(email);
                    // Record metrics
                    const duration = Date.now() - startTime;
                    await this.metrics.recordLatency('email_send', duration);
                    await this.metrics.recordEvent('email_sent');
                    await this.metrics.recordEmailSent(this.config.provider, options.template || 'default', 'success');
                    return {
                        messageId: result.id,
                        status: 'sent',
                        timestamp: new Date().toISOString(),
                        provider: this.config.provider,
                        metadata: {
                            duration,
                            attempts: attempts + 1
                        }
                    };
                }
                catch (e) {
                    error = e instanceof Error ? e : new Error(String(e));
                    attempts++;
                    if (attempts < this.config.retryOptions.maxAttempts) {
                        await this.sleep(Math.min(this.config.retryOptions.maxDelay, this.config.retryOptions.initialDelay * Math.pow(2, attempts)));
                    }
                }
            }
            // Record failure metrics
            await this.metrics.recordError('email_send', (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error');
            await this.metrics.recordEmailSent(this.config.provider, options.template || 'default', 'failed');
            throw error;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await this.metrics.recordError('email_send', errorMessage);
            throw error;
        }
    }
    async sendWithProvider(email) {
        // Mock provider implementation
        return {
            id: `msg_${Date.now()}`,
            status: 'sent'
        };
    }
    async checkRateLimits() {
        const now = Date.now();
        // Refill tokens
        this.refillTokens('perSecond', now, 1000);
        this.refillTokens('perMinute', now, 60000);
        this.refillTokens('perHour', now, 3600000);
        // Check if we have enough tokens
        if (this.rateLimitTokens.perSecond <= 0 ||
            this.rateLimitTokens.perMinute <= 0 ||
            this.rateLimitTokens.perHour <= 0) {
            throw new Error('Rate limit exceeded');
        }
        // Consume tokens
        this.rateLimitTokens.perSecond--;
        this.rateLimitTokens.perMinute--;
        this.rateLimitTokens.perHour--;
    }
    refillTokens(type, now, interval) {
        const timeSinceLastRefill = now - this.lastRefill[type];
        const tokensToAdd = Math.floor(timeSinceLastRefill / interval);
        if (tokensToAdd > 0) {
            this.rateLimitTokens[type] = Math.min(this.config.rateLimits[type], this.rateLimitTokens[type] + tokensToAdd);
            this.lastRefill[type] = now;
        }
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.EmailService = EmailService;

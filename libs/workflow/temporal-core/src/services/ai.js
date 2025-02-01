"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const openai_1 = require("openai");
const deepseek_1 = require("../lib/ai/deepseek");
class AIService {
    constructor(config, metrics) {
        this.config = config;
        this.metrics = metrics;
        this.cache = new Map();
        this.openai = new openai_1.OpenAI({
            apiKey: config.openai.apiKey
        });
        this.deepseek = new deepseek_1.DeepSeek({
            apiKey: config.deepseek.apiKey
        });
    }
    async analyzeContent(content) {
        const startTime = Date.now();
        try {
            const cacheKey = `analysis_${this.hashString(content)}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                return cached;
            }
            let attempts = 0;
            let lastError;
            while (attempts < this.config.retryOptions.maxAttempts) {
                try {
                    const [engagementAnalysis, readabilityAnalysis, spamAnalysis] = await Promise.all([
                        this.analyzeEngagement(content),
                        this.analyzeReadability(content),
                        this.analyzeSpamScore(content)
                    ]);
                    const result = {
                        engagementScore: engagementAnalysis.score,
                        suggestedImprovements: engagementAnalysis.improvements,
                        sentiment: await this.analyzeSentiment(content),
                        readability: readabilityAnalysis,
                        spamScore: spamAnalysis
                    };
                    this.setInCache(cacheKey, result);
                    const duration = Date.now() - startTime;
                    await this.metrics.recordLatency('content_analysis', duration);
                    await this.metrics.recordEvent('content_analyzed');
                    return result;
                }
                catch (error) {
                    lastError = error instanceof Error ? error : new Error(String(error));
                    attempts++;
                    if (attempts < this.config.retryOptions.maxAttempts) {
                        await this.sleep(Math.min(this.config.retryOptions.maxDelay, this.config.retryOptions.initialDelay * Math.pow(2, attempts)));
                    }
                }
            }
            throw lastError;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await this.metrics.recordError('content_analysis', errorMessage);
            throw error;
        }
    }
    async generateContentVariations(content, target, constraints, maxVariations) {
        const startTime = Date.now();
        try {
            const cacheKey = `variations_${this.hashString(content + target + JSON.stringify(constraints))}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                return cached;
            }
            const prompt = this.buildVariationPrompt(content, target, constraints);
            const completion = await this.openai.chat.completions.create({
                model: this.config.openai.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert content optimizer. Generate variations that maintain the core message while optimizing for engagement.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                n: maxVariations,
                temperature: this.config.openai.temperature,
                max_tokens: this.config.openai.maxTokens,
                top_p: this.config.openai.topP,
                frequency_penalty: this.config.openai.frequencyPenalty,
                presence_penalty: this.config.openai.presencePenalty
            });
            const variations = completion.choices.map(choice => { var _a; return (_a = choice.message.content) === null || _a === void 0 ? void 0 : _a.trim(); }).filter((content) => content !== null);
            this.setInCache(cacheKey, variations);
            const duration = Date.now() - startTime;
            await this.metrics.recordLatency('content_variation_generation', duration);
            await this.metrics.recordEvent('content_variations_generated', variations.length);
            return variations;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await this.metrics.recordError('content_variation_generation', errorMessage);
            throw error;
        }
    }
    async predictEngagement(features) {
        const startTime = Date.now();
        try {
            const cacheKey = `engagement_${this.hashString(JSON.stringify(features))}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                return cached;
            }
            // Use DeepSeek for engagement prediction
            const prediction = await this.deepseek.predict('engagement', features);
            const result = {
                optimalTime: prediction.optimalTime,
                confidence: prediction.confidence,
                expectedEngagement: prediction.score,
                factors: prediction.factors,
                alternatives: prediction.alternatives
            };
            this.setInCache(cacheKey, result);
            const duration = Date.now() - startTime;
            await this.metrics.recordLatency('engagement_prediction', duration);
            await this.metrics.recordEvent('engagement_predicted');
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await this.metrics.recordError('engagement_prediction', errorMessage);
            throw error;
        }
    }
    async extractContentFeatures(content) {
        const startTime = Date.now();
        try {
            const cacheKey = `features_${this.hashString(content)}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                return cached;
            }
            const features = await this.deepseek.extractFeatures(content);
            this.setInCache(cacheKey, features);
            const duration = Date.now() - startTime;
            await this.metrics.recordLatency('feature_extraction', duration);
            await this.metrics.recordEvent('features_extracted');
            return features;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await this.metrics.recordError('feature_extraction', errorMessage);
            throw error;
        }
    }
    async analyzeEngagement(content) {
        const analysis = await this.deepseek.analyze('engagement', content);
        return {
            score: analysis.score,
            improvements: analysis.improvements
        };
    }
    async analyzeReadability(content) {
        const analysis = await this.deepseek.analyze('readability', content);
        return {
            score: analysis.score,
            grade: analysis.grade,
            suggestions: analysis.suggestions
        };
    }
    async analyzeSpamScore(content) {
        const analysis = await this.deepseek.analyze('spam', content);
        return analysis.score;
    }
    async analyzeSentiment(content) {
        const analysis = await this.deepseek.analyze('sentiment', content);
        return {
            score: analysis.score,
            label: analysis.label
        };
    }
    buildVariationPrompt(content, target, constraints) {
        return `
Generate variations of the following content while optimizing for ${target}.

Original content:
${content}

Constraints:
${Object.entries(constraints)
            .map(([key, value]) => `- ${key}: ${value}`)
            .join('\n')}

Please generate variations that:
1. Maintain the core message and intent
2. Optimize for the target metric
3. Follow all specified constraints
4. Use different approaches and tones
5. Are natural and engaging
`;
    }
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && cached.expires > Date.now()) {
            return cached.value;
        }
        this.cache.delete(key);
        return null;
    }
    setInCache(key, value) {
        if (this.cache.size >= this.config.cacheConfig.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
        this.cache.set(key, {
            value,
            expires: Date.now() + this.config.cacheConfig.ttl
        });
    }
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.AIService = AIService;

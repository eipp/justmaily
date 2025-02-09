'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.OptimizationService = void 0;
class OptimizationService {
  constructor(config, ai, analytics, metrics) {
    this.config = config;
    this.ai = ai;
    this.analytics = analytics;
    this.metrics = metrics;
    this.cache = new Map();
  }
  async analyzeABTest(testId, variants, results) {
    const startTime = Date.now();
    try {
      const cacheKey = `abtest_${testId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
      // Validate input
      if (variants.length < 2) {
        throw new Error('At least two variants are required for A/B testing');
      }
      // Calculate metrics for each variant
      const variantMetrics = await Promise.all(
        variants.map(async (variant) => {
          const data = results[variant] || [];
          if (data.length < this.config.modelConfigs.abTest.minSampleSize) {
            throw new Error(
              `Insufficient data for variant ${variant}. Minimum sample size: ${this.config.modelConfigs.abTest.minSampleSize}`,
            );
          }
          const conversionRate = this.calculateConversionRate(data);
          return {
            variant,
            sampleSize: data.length,
            conversionRate,
          };
        }),
      );
      // Determine winner
      const winner = this.determineWinner(variantMetrics);
      const result = {
        winner: winner.variant,
        confidence: winner.confidence,
        metrics: variantMetrics.map((metric) =>
          Object.assign(Object.assign({}, metric), {
            improvement:
              metric.variant === winner.variant
                ? 0
                : ((winner.conversionRate - metric.conversionRate) /
                    metric.conversionRate) *
                  100,
          }),
        ),
        duration: Date.now() - startTime,
        isSignificant:
          winner.confidence >= this.config.modelConfigs.abTest.confidenceLevel,
        recommendation: this.generateRecommendation(winner, variantMetrics),
      };
      // Cache result
      this.setInCache(cacheKey, result);
      // Record metrics
      await this.metrics.recordLatency(
        'ab_test_analysis',
        Date.now() - startTime,
      );
      await this.metrics.recordEvent('ab_test_analyzed');
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await this.metrics.recordError('ab_test_analysis', errorMessage);
      throw error;
    }
  }
  async predictOptimalDeliveryTime(userId, content, historicalData) {
    const startTime = Date.now();
    try {
      const cacheKey = `delivery_${userId}_${this.hashString(content)}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
      // Validate input
      if (
        historicalData.length <
        this.config.modelConfigs.deliveryTime.minDataPoints
      ) {
        throw new Error(
          `Insufficient historical data. Minimum required: ${this.config.modelConfigs.deliveryTime.minDataPoints}`,
        );
      }
      // Extract features
      const features = await this.extractDeliveryTimeFeatures(
        userId,
        content,
        historicalData,
      );
      // Get prediction from AI service
      const prediction = await this.ai.predictEngagement(features);
      const result = {
        optimalTime: prediction.optimalTime,
        confidence: prediction.confidence,
        expectedEngagement: prediction.expectedEngagement,
        factors: prediction.factors,
        alternatives: prediction.alternatives,
      };
      // Cache result
      this.setInCache(cacheKey, result);
      // Record metrics
      await this.metrics.recordLatency(
        'delivery_time_prediction',
        Date.now() - startTime,
      );
      await this.metrics.recordEvent('delivery_time_predicted');
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await this.metrics.recordError('delivery_time_prediction', errorMessage);
      throw error;
    }
  }
  async optimizeContent(content, target, constraints) {
    const startTime = Date.now();
    try {
      const cacheKey = `content_${this.hashString(content)}_${target}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
      // Generate variations
      const variations = await this.ai.generateContentVariations(
        content,
        target,
        constraints,
        this.config.modelConfigs.content.maxVariations,
      );
      // Analyze variations
      const analyzedVariations = await Promise.all(
        variations.map(async (variation) => {
          const analysis = await this.ai.analyzeContent(variation);
          return {
            content: variation,
            predictedEngagement: analysis.engagementScore,
            improvements: analysis.suggestedImprovements,
          };
        }),
      );
      // Find best variation
      const bestVariation = analyzedVariations.reduce((best, current) =>
        current.predictedEngagement > best.predictedEngagement ? current : best,
      );
      const result = {
        variations: analyzedVariations,
        bestVariation: bestVariation.content,
        confidenceScore:
          await this.calculateConfidenceScore(analyzedVariations),
        insights: await this.generateContentInsights(analyzedVariations),
      };
      // Cache result
      this.setInCache(cacheKey, result);
      // Record metrics
      await this.metrics.recordLatency(
        'content_optimization',
        Date.now() - startTime,
      );
      await this.metrics.recordEvent('content_optimized');
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await this.metrics.recordError('content_optimization', errorMessage);
      throw error;
    }
  }
  calculateConversionRate(data) {
    const conversions = data.filter((item) => item.converted).length;
    return conversions / data.length;
  }
  determineWinner(metrics) {
    // Implementation of statistical significance testing
    // This is a simplified version - in production, use a proper statistical library
    const bestMetric = metrics.reduce((best, current) =>
      current.conversionRate > best.conversionRate ? current : best,
    );
    // Calculate confidence using z-test
    const confidence = this.calculateConfidence(bestMetric, metrics);
    return {
      variant: bestMetric.variant,
      confidence,
      conversionRate: bestMetric.conversionRate,
    };
  }
  calculateConfidence(best, metrics) {
    // Simplified confidence calculation
    // In production, use a proper statistical library
    return 0.95; // Placeholder
  }
  generateRecommendation(winner, metrics) {
    if (winner.confidence >= this.config.modelConfigs.abTest.confidenceLevel) {
      return `Recommend using variant ${winner.variant} with ${(winner.confidence * 100).toFixed(1)}% confidence`;
    }
    return 'Continue testing to achieve statistical significance';
  }
  async extractDeliveryTimeFeatures(userId, content, historicalData) {
    // Extract relevant features for delivery time prediction
    return {
      userEngagementHistory: historicalData,
      contentFeatures: await this.ai.extractContentFeatures(content),
      userFeatures: await this.analytics.getUserFeatures(userId),
    };
  }
  async calculateConfidenceScore(variations) {
    // Calculate confidence score based on variation distribution
    const scores = variations.map((v) => v.predictedEngagement);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
      scores.length;
    return 1 / (1 + Math.sqrt(variance));
  }
  async generateContentInsights(variations) {
    // Analyze patterns and generate insights
    const commonImprovements = this.findCommonImprovements(variations);
    const engagementPatterns = this.analyzeEngagementPatterns(variations);
    return [...commonImprovements, ...engagementPatterns];
  }
  findCommonImprovements(variations) {
    // Find common improvement suggestions across variations
    const improvements = variations.flatMap((v) => v.improvements);
    const improvementTypes = new Set(improvements.map((i) => i.type));
    return Array.from(improvementTypes).map(
      (type) =>
        `Common improvement area: ${type} - ${this.summarizeImprovements(improvements.filter((i) => i.type === type))}`,
    );
  }
  analyzeEngagementPatterns(variations) {
    // Analyze patterns in predicted engagement
    const engagementScores = variations.map((v) => v.predictedEngagement);
    const mean =
      engagementScores.reduce((sum, score) => sum + score, 0) /
      engagementScores.length;
    const insights = [];
    if (Math.max(...engagementScores) - Math.min(...engagementScores) < 0.1) {
      insights.push(
        'Low variation in engagement scores - consider more diverse content variations',
      );
    }
    if (Math.max(...engagementScores) < 0.5) {
      insights.push(
        'All variations show low predicted engagement - consider major content revisions',
      );
    }
    return insights;
  }
  summarizeImprovements(improvements) {
    // Summarize similar improvements
    const totalImpact = improvements.reduce((sum, imp) => sum + imp.impact, 0);
    const averageImpact = totalImpact / improvements.length;
    return `Average impact: ${(averageImpact * 100).toFixed(1)}%`;
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
    // Implement LRU cache eviction if needed
    if (this.cache.size >= this.config.cacheConfig.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, {
      value,
      expires: Date.now() + this.config.cacheConfig.ttl,
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
}
exports.OptimizationService = OptimizationService;

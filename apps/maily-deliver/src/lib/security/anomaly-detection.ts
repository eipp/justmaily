import { Redis } from 'ioredis'

import { MetricsService } from '../monitoring'
import { SecurityService } from './security'

interface AnomalyConfig {
  enabled: boolean
  features: {
    loginPatterns: boolean
    requestPatterns: boolean
    userBehavior: boolean
    systemMetrics: boolean
  }
  thresholds: {
    zscore: number
    madScore: number
    isolationScore: number
  }
  windows: {
    shortTerm: number  // minutes
    mediumTerm: number // hours
    longTerm: number   // days
  }
  learning: {
    minDataPoints: number
    updateFrequency: number // minutes
  }
}

interface FeatureVector {
  timestamp: number
  features: number[]
  labels: string[]
}

interface AnomalyScore {
  score: number
  confidence: number
  features: string[]
  details: Record<string, any>
}

export class AnomalyDetection {
  private redis: Redis
  private baselineData: Map<string, FeatureVector[]> = new Map()
  private modelState: Map<string, any> = new Map()
  
  constructor(
    private config: AnomalyConfig,
    private metrics: MetricsService,
    private security: SecurityService,
    redisUrl: string
  ) {
    this.redis = new Redis(redisUrl)
    this.initializeService()
  }

  async detectAnomalies(
    context: {
      userId?: string
      action: string
      timestamp: number
      features: Record<string, number>
      metadata?: Record<string, any>
    }
  ): Promise<AnomalyScore> {
    try {
      const startTime = Date.now()
      
      // Extract and normalize features
      const featureVector = await this.extractFeatures(context)
      
      // Calculate anomaly scores using different methods
      const [
        zScore,
        madScore,
        isolationScore
      ] = await Promise.all([
        this.calculateZScore(featureVector),
        this.calculateMADScore(featureVector),
        this.calculateIsolationScore(featureVector)
      ])

      // Combine scores with weights
      const score = this.combineScores({
        zScore,
        madScore,
        isolationScore
      })

      // Update baseline data
      await this.updateBaseline(context.userId || 'global', featureVector)

      await this.metrics.recordLatency(
        'anomaly_detection',
        Date.now() - startTime
      )
      
      return {
        score: score.value,
        confidence: score.confidence,
        features: featureVector.labels,
        details: {
          zScore,
          madScore,
          isolationScore,
          baseline: await this.getBaselineStats(context.userId)
        }
      }
    } catch (error) {
      await this.metrics.recordError('anomaly_detection', error.message)
      throw error
    }
  }

  async getAnomalyStats(): Promise<{
    totalDetections: number
    averageScore: number
    featureImportance: Record<string, number>
    recentAnomalies: Array<{
      timestamp: number
      score: number
      features: string[]
    }>
  }> {
    try {
      const stats = await this.redis.hgetall('anomaly_stats')
      return {
        totalDetections: parseInt(stats.total_detections || '0'),
        averageScore: parseFloat(stats.average_score || '0'),
        featureImportance: JSON.parse(stats.feature_importance || '{}'),
        recentAnomalies: JSON.parse(stats.recent_anomalies || '[]')
      }
    } catch (error) {
      await this.metrics.recordError('anomaly_stats', error.message)
      throw error
    }
  }

  // Private Methods
  private async initializeService(): Promise<void> {
    try {
      // Load baseline data from Redis
      await this.loadBaselines()
      
      // Initialize model state
      await this.initializeModels()
      
      // Setup metrics
      this.setupMetrics()
      
      // Start background learning process
      this.startBackgroundLearning()
    } catch (error) {
      console.error('Failed to initialize anomaly detection:', error)
    }
  }

  private async extractFeatures(
    context: any
  ): Promise<FeatureVector> {
    const features: number[] = []
    const labels: string[] = []

    // Login pattern features
    if (this.config.features.loginPatterns) {
      const loginFeatures = await this.extractLoginFeatures(context)
      features.push(...loginFeatures.values)
      labels.push(...loginFeatures.labels)
    }

    // Request pattern features
    if (this.config.features.requestPatterns) {
      const requestFeatures = await this.extractRequestFeatures(context)
      features.push(...requestFeatures.values)
      labels.push(...requestFeatures.labels)
    }

    // User behavior features
    if (this.config.features.userBehavior) {
      const behaviorFeatures = await this.extractBehaviorFeatures(context)
      features.push(...behaviorFeatures.values)
      labels.push(...behaviorFeatures.labels)
    }

    // System metrics features
    if (this.config.features.systemMetrics) {
      const metricFeatures = await this.extractMetricFeatures(context)
      features.push(...metricFeatures.values)
      labels.push(...metricFeatures.labels)
    }

    return {
      timestamp: context.timestamp,
      features,
      labels
    }
  }

  private async calculateZScore(
    vector: FeatureVector
  ): Promise<number> {
    const baseline = this.baselineData.get('global') || []
    if (baseline.length < this.config.learning.minDataPoints) {
      return 0
    }

    const means = this.calculateMeans(baseline)
    const stds = this.calculateStandardDeviations(baseline, means)
    
    const zScores = vector.features.map((value, i) => 
      Math.abs((value - means[i]) / (stds[i] || 1))
    )
    
    return Math.max(...zScores)
  }

  private async calculateMADScore(
    vector: FeatureVector
  ): Promise<number> {
    const baseline = this.baselineData.get('global') || []
    if (baseline.length < this.config.learning.minDataPoints) {
      return 0
    }

    const medians = this.calculateMedians(baseline)
    const mads = this.calculateMADs(baseline, medians)
    
    const madScores = vector.features.map((value, i) =>
      Math.abs((value - medians[i]) / (mads[i] || 1))
    )
    
    return Math.max(...madScores)
  }

  private async calculateIsolationScore(
    vector: FeatureVector
  ): Promise<number> {
    const baseline = this.baselineData.get('global') || []
    if (baseline.length < this.config.learning.minDataPoints) {
      return 0
    }

    // Simple isolation forest-like algorithm
    const scores: number[] = []
    const samples = 10
    const subSampleSize = Math.min(baseline.length, 100)
    
    for (let i = 0; i < samples; i++) {
      const subSample = this.getRandomSubsample(baseline, subSampleSize)
      const score = this.calculateIsolationTreeScore(vector, subSample)
      scores.push(score)
    }
    
    return scores.reduce((a, b) => a + b, 0) / scores.length
  }

  private async updateBaseline(
    key: string,
    vector: FeatureVector
  ): Promise<void> {
    let baseline = this.baselineData.get(key) || []
    
    // Add new vector
    baseline.push(vector)
    
    // Remove old data points
    const cutoff = Date.now() - (this.config.windows.longTerm * 24 * 60 * 60 * 1000)
    baseline = baseline.filter(v => v.timestamp >= cutoff)
    
    // Update baseline
    this.baselineData.set(key, baseline)
    
    // Persist to Redis
    await this.redis.setex(
      `anomaly_baseline:${key}`,
      this.config.windows.longTerm * 24 * 60 * 60,
      JSON.stringify(baseline)
    )
  }

  private async loadBaselines(): Promise<void> {
    const keys = await this.redis.keys('anomaly_baseline:*')
    for (const key of keys) {
      const data = await this.redis.get(key)
      if (data) {
        const baseline = JSON.parse(data)
        const userId = key.split(':')[1]
        this.baselineData.set(userId, baseline)
      }
    }
  }

  private async initializeModels(): Promise<void> {
    // Initialize model state (e.g., isolation forest parameters)
    this.modelState.set('isolationForest', {
      maxDepth: 10,
      subSamplingSize: 256,
      numberOfTrees: 100
    })
  }

  private startBackgroundLearning(): void {
    setInterval(async () => {
      try {
        await this.updateModels()
      } catch (error) {
        console.error('Background learning error:', error)
      }
    }, this.config.learning.updateFrequency * 60 * 1000)
  }

  private async updateModels(): Promise<void> {
    // Update model parameters based on recent data
    const baseline = this.baselineData.get('global') || []
    if (baseline.length >= this.config.learning.minDataPoints) {
      // Update isolation forest parameters
      const modelState = this.modelState.get('isolationForest')
      modelState.maxDepth = Math.ceil(Math.log2(baseline.length))
      this.modelState.set('isolationForest', modelState)
    }
  }

  private async extractLoginFeatures(context: any): Promise<{
    values: number[]
    labels: string[]
  }> {
    // Extract login-related features
    return {
      values: [],
      labels: []
    }
  }

  private async extractRequestFeatures(context: any): Promise<{
    values: number[]
    labels: string[]
  }> {
    // Extract request pattern features
    return {
      values: [],
      labels: []
    }
  }

  private async extractBehaviorFeatures(context: any): Promise<{
    values: number[]
    labels: string[]
  }> {
    // Extract user behavior features
    return {
      values: [],
      labels: []
    }
  }

  private async extractMetricFeatures(context: any): Promise<{
    values: number[]
    labels: string[]
  }> {
    // Extract system metric features
    return {
      values: [],
      labels: []
    }
  }

  private calculateMeans(vectors: FeatureVector[]): number[] {
    const sums = new Array(vectors[0].features.length).fill(0)
    vectors.forEach(vector => {
      vector.features.forEach((value, i) => {
        sums[i] += value
      })
    })
    return sums.map(sum => sum / vectors.length)
  }

  private calculateStandardDeviations(
    vectors: FeatureVector[],
    means: number[]
  ): number[] {
    const squaredDiffs = new Array(means.length).fill(0)
    vectors.forEach(vector => {
      vector.features.forEach((value, i) => {
        squaredDiffs[i] += Math.pow(value - means[i], 2)
      })
    })
    return squaredDiffs.map(sum => Math.sqrt(sum / vectors.length))
  }

  private calculateMedians(vectors: FeatureVector[]): number[] {
    const numFeatures = vectors[0].features.length
    const medians = new Array(numFeatures)
    
    for (let i = 0; i < numFeatures; i++) {
      const values = vectors.map(v => v.features[i]).sort((a, b) => a - b)
      const mid = Math.floor(values.length / 2)
      medians[i] = values.length % 2 === 0
        ? (values[mid - 1] + values[mid]) / 2
        : values[mid]
    }
    
    return medians
  }

  private calculateMADs(
    vectors: FeatureVector[],
    medians: number[]
  ): number[] {
    const numFeatures = vectors[0].features.length
    const mads = new Array(numFeatures)
    
    for (let i = 0; i < numFeatures; i++) {
      const deviations = vectors.map(v => 
        Math.abs(v.features[i] - medians[i])
      ).sort((a, b) => a - b)
      
      const mid = Math.floor(deviations.length / 2)
      mads[i] = deviations.length % 2 === 0
        ? (deviations[mid - 1] + deviations[mid]) / 2
        : deviations[mid]
    }
    
    return mads
  }

  private getRandomSubsample(
    vectors: FeatureVector[],
    size: number
  ): FeatureVector[] {
    const indices = new Set<number>()
    while (indices.size < size) {
      indices.add(Math.floor(Math.random() * vectors.length))
    }
    return Array.from(indices).map(i => vectors[i])
  }

  private calculateIsolationTreeScore(
    vector: FeatureVector,
    subsample: FeatureVector[]
  ): number {
    const modelState = this.modelState.get('isolationForest')
    let depth = 0
    let currentSample = subsample
    
    while (depth < modelState.maxDepth && currentSample.length > 1) {
      const featureIndex = Math.floor(Math.random() * vector.features.length)
      const splitValue = this.calculateSplitValue(currentSample, featureIndex)
      
      if (vector.features[featureIndex] < splitValue) {
        currentSample = currentSample.filter(v => 
          v.features[featureIndex] < splitValue
        )
      } else {
        currentSample = currentSample.filter(v => 
          v.features[featureIndex] >= splitValue
        )
      }
      
      depth++
    }
    
    return depth / modelState.maxDepth
  }

  private calculateSplitValue(
    vectors: FeatureVector[],
    featureIndex: number
  ): number {
    const min = Math.min(...vectors.map(v => v.features[featureIndex]))
    const max = Math.max(...vectors.map(v => v.features[featureIndex]))
    return min + Math.random() * (max - min)
  }

  private combineScores(scores: {
    zScore: number
    madScore: number
    isolationScore: number
  }): {
    value: number
    confidence: number
  } {
    const weights = {
      zScore: 0.3,
      madScore: 0.3,
      isolationScore: 0.4
    }
    
    const value = (
      scores.zScore * weights.zScore +
      scores.madScore * weights.madScore +
      scores.isolationScore * weights.isolationScore
    )
    
    const confidence = Math.min(
      1,
      Math.max(scores.zScore, scores.madScore, scores.isolationScore) / 
      this.config.thresholds.zscore
    )
    
    return { value, confidence }
  }

  private async getBaselineStats(userId?: string): Promise<{
    dataPoints: number
    timeRange: {
      start: number
      end: number
    }
    features: {
      name: string
      mean: number
      std: number
      median: number
      mad: number
    }[]
  }> {
    const baseline = this.baselineData.get(userId || 'global') || []
    if (baseline.length === 0) {
      return {
        dataPoints: 0,
        timeRange: { start: 0, end: 0 },
        features: []
      }
    }

    const means = this.calculateMeans(baseline)
    const stds = this.calculateStandardDeviations(baseline, means)
    const medians = this.calculateMedians(baseline)
    const mads = this.calculateMADs(baseline, medians)

    return {
      dataPoints: baseline.length,
      timeRange: {
        start: Math.min(...baseline.map(v => v.timestamp)),
        end: Math.max(...baseline.map(v => v.timestamp))
      },
      features: baseline[0].labels.map((label, i) => ({
        name: label,
        mean: means[i],
        std: stds[i],
        median: medians[i],
        mad: mads[i]
      }))
    }
  }

  private setupMetrics(): void {
    this.metrics.registerCounter(
      'anomaly_detections_total',
      'Total number of anomaly detections'
    )
    this.metrics.registerHistogram(
      'anomaly_scores',
      'Distribution of anomaly scores',
      [0.1, 0.2, 0.5, 0.8, 0.9, 0.95, 0.99]
    )
    this.metrics.registerHistogram(
      'anomaly_detection_latency',
      'Anomaly detection latency in seconds',
      [0.01, 0.05, 0.1, 0.5, 1]
    )
    this.metrics.registerGauge(
      'baseline_data_points',
      'Number of data points in baseline'
    )
  }
} 
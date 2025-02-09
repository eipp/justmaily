import { MetricsService } from './monitoring'
import { SecurityService } from './security'

// Initialize DOMPurify in Node.js environment
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
const window = new JSDOM('').window
const DOMPurify = createDOMPurify(window)

interface SanitizerConfig {
  maxLength?: number
  allowedTags?: string[]
  allowedAttributes?: Record<string, string[]>
  allowedPatterns?: RegExp[]
  disallowedPatterns?: RegExp[]
  transformations?: Array<{
    pattern: RegExp
    replacement: string
  }>
}

const defaultConfig: SanitizerConfig = {
  maxLength: 10000,
  allowedTags: [],
  allowedAttributes: {},
  allowedPatterns: [
    /^[\p{L}\p{N}\p{P}\p{Z}]+$/u, // Letters, numbers, punctuation, whitespace
  ],
  disallowedPatterns: [
    // Potential prompt injection patterns
    /\{.*\}/,           // Curly braces
    /\[.*\]/,           // Square brackets
    /\<.*\>/,           // Angle brackets
    /\$\{.*\}/,         // Template literals
    /\\\w+/,            // Escape sequences
    /\b(system|user|assistant)\s*:/i, // Role markers
    /\b(ignore|disregard|forget)\b.*\b(previous|above|before)\b/i, // Instruction manipulation
    /\b(prompt|instruction|command)\b.*\b(override|bypass|ignore)\b/i, // Control manipulation
    
    // Code injection patterns
    /\b(eval|exec|system|require|import)\b/i,
    /\b(function|=>|class|constructor)\b/i,
    /[<>]script/i,
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    
    // SQL injection patterns
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|JOIN)\b/i,
    /\b(WHERE|FROM|INTO|VALUES)\b.*=.*/i,
    /--.*$/m,
    /\/\*.*\*\//,
    
    // Command injection patterns
    /[&|;`$]/,
    /\b(cmd|powershell|bash|sh)\b/i,
    
    // Path traversal
    /\.\./,
    /~\//,
    
    // Potential sensitive data patterns
    /\b\d{16}\b/,      // Credit card numbers
    /\b\d{9}\b/,       // SSN
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, // Email addresses
  ],
  transformations: [
    // Remove excessive whitespace
    { pattern: /\s+/g, replacement: ' ' },
    // Remove zero-width characters
    { pattern: /[\u200B-\u200D\uFEFF]/g, replacement: '' },
    // Remove control characters
    { pattern: /[\x00-\x1F\x7F]/g, replacement: '' },
    // Remove Unicode control characters
    { pattern: /[\u2000-\u200F\u2028-\u202F]/g, replacement: ' ' },
  ]
}

export class InputSanitizer {
  private config: SanitizerConfig
  private metrics: MetricsService
  private security: SecurityService

  constructor(
    config: Partial<SanitizerConfig> = {},
    metrics: MetricsService,
    security: SecurityService
  ) {
    this.config = { ...defaultConfig, ...config }
    this.metrics = metrics
    this.security = security
  }

  async sanitizeInput(input: string): Promise<string> {
    const startTime = Date.now()

    try {
      // Check input length
      if (this.config.maxLength && input.length > this.config.maxLength) {
        throw new Error(`Input exceeds maximum length of ${this.config.maxLength} characters`)
      }

      // Apply transformations
      let sanitized = input
      for (const { pattern, replacement } of this.config.transformations || []) {
        sanitized = sanitized.replace(pattern, replacement)
      }

      // Check for disallowed patterns
      for (const pattern of this.config.disallowedPatterns || []) {
        if (pattern.test(sanitized)) {
          const match = sanitized.match(pattern)?.[0]
          await this.security.logAuditEvent({
            action: 'input_sanitization_blocked',
            userId: 'system',
            resource: 'input_sanitizer',
            details: {
              pattern: pattern.toString(),
              match,
              input: sanitized.substring(0, 100) + '...' // Log only the first 100 chars
            }
          })
          throw new Error('Input contains disallowed pattern')
        }
      }

      // Check for allowed patterns
      if (this.config.allowedPatterns?.length) {
        const isAllowed = this.config.allowedPatterns.some(pattern =>
          pattern.test(sanitized)
        )
        if (!isAllowed) {
          throw new Error('Input does not match any allowed pattern')
        }
      }

      // Sanitize HTML if any tags are allowed
      if (this.config.allowedTags?.length) {
        sanitized = DOMPurify.sanitize(sanitized, {
          ALLOWED_TAGS: this.config.allowedTags,
          ALLOWED_ATTR: this.config.allowedAttributes || [],
          ALLOW_DATA_ATTR: false,
          ALLOW_UNKNOWN_PROTOCOLS: false,
          ALLOW_SCRIPT_URLS: false,
          USE_PROFILES: { html: true },
        })
      }

      // Trim result
      sanitized = sanitized.trim()

      // Record metrics
      await this.metrics.recordLatency(
        'input_sanitization',
        Date.now() - startTime
      )

      if (sanitized !== input) {
        await this.metrics.incrementCounter('input_sanitization_modified')
      }

      return sanitized
    } catch (error) {
      await this.metrics.recordError('input_sanitization', error.message)
      throw error
    }
  }

  async sanitizeBatch(
    inputs: string[],
    options: { failFast?: boolean } = {}
  ): Promise<string[]> {
    const startTime = Date.now()
    const results: string[] = []
    const errors: Error[] = []

    for (const input of inputs) {
      try {
        const sanitized = await this.sanitizeInput(input)
        results.push(sanitized)
      } catch (error) {
        if (options.failFast) {
          throw error
        }
        errors.push(error as Error)
        results.push('')
      }
    }

    await this.metrics.recordLatency(
      'input_sanitization_batch',
      Date.now() - startTime
    )

    if (errors.length > 0) {
      await this.metrics.recordError(
        'input_sanitization_batch',
        `${errors.length} inputs failed sanitization`
      )
    }

    if (errors.length === inputs.length) {
      throw new Error('All inputs failed sanitization')
    }

    return results
  }

  updateConfig(newConfig: Partial<SanitizerConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
      // Merge arrays and objects instead of replacing
      allowedTags: [
        ...(this.config.allowedTags || []),
        ...(newConfig.allowedTags || [])
      ],
      allowedAttributes: {
        ...(this.config.allowedAttributes || {}),
        ...(newConfig.allowedAttributes || {})
      },
      allowedPatterns: [
        ...(this.config.allowedPatterns || []),
        ...(newConfig.allowedPatterns || [])
      ],
      disallowedPatterns: [
        ...(this.config.disallowedPatterns || []),
        ...(newConfig.disallowedPatterns || [])
      ],
      transformations: [
        ...(this.config.transformations || []),
        ...(newConfig.transformations || [])
      ]
    }
  }
} 
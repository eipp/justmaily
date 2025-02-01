import { z } from 'zod'
import { sanitizeInput } from './sanitizer'
import { MetricsService } from './monitoring'
import { SecurityService } from './security'

// Validation schemas for template variables
const templateVariableSchema = z.object({
  name: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
  type: z.enum(['string', 'number', 'array', 'object']),
  required: z.boolean().default(false),
  maxLength: z.number().optional(),
  minLength: z.number().optional(),
  pattern: z.string().optional(),
  enum: z.array(z.string()).optional(),
  description: z.string().optional(),
})

const templateSchema = z.object({
  id: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/),
  version: z.number().int().positive(),
  template: z.string(),
  variables: z.record(templateVariableSchema),
  description: z.string().optional(),
  category: z.string().optional(),
  maxTokens: z.number().int().positive().optional(),
  temperature: z.number().min(0).max(1).optional(),
  systemPrompt: z.string().optional(),
})

export interface PromptTemplate {
  id: string
  version: number
  template: string
  variables: Record<string, z.infer<typeof templateVariableSchema>>
  description?: string
  category?: string
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
}

export class PromptTemplateManager {
  private templates: Map<string, PromptTemplate> = new Map()
  private templateVersions: Map<string, number> = new Map()

  constructor(
    private metrics: MetricsService,
    private security: SecurityService
  ) {}

  registerTemplate(template: unknown): void {
    // Validate template structure
    const validatedTemplate = templateSchema.parse(template)

    // Check for existing template version
    const currentVersion = this.templateVersions.get(validatedTemplate.id) || 0
    if (validatedTemplate.version <= currentVersion) {
      throw new Error(
        `Template version must be greater than current version (${currentVersion})`
      )
    }

    // Store template
    this.templates.set(validatedTemplate.id, validatedTemplate)
    this.templateVersions.set(validatedTemplate.id, validatedTemplate.version)

    // Audit log template registration
    this.security.logAuditEvent({
      action: 'template_registered',
      userId: 'system',
      resource: 'prompt_template',
      details: {
        templateId: validatedTemplate.id,
        version: validatedTemplate.version,
      }
    })
  }

  async renderTemplate(
    templateId: string,
    variables: Record<string, unknown>,
    context: {
      userId: string
      requestId: string
      maxTokens?: number
      temperature?: number
    }
  ): Promise<{
    prompt: string
    systemPrompt?: string
    maxTokens?: number
    temperature?: number
  }> {
    const startTime = Date.now()

    try {
      // Get template
      const template = this.templates.get(templateId)
      if (!template) {
        throw new Error(`Template not found: ${templateId}`)
      }

      // Validate and sanitize variables
      const sanitizedVariables = await this.validateAndSanitizeVariables(
        template.variables,
        variables
      )

      // Check for sensitive data
      await this.checkSensitiveData(sanitizedVariables)

      // Render template
      const prompt = await this.renderWithVariables(
        template.template,
        sanitizedVariables
      )

      // Record metrics
      await this.metrics.recordLatency(
        'prompt_template_render',
        Date.now() - startTime
      )

      // Audit log template usage
      await this.security.logAuditEvent({
        action: 'template_rendered',
        userId: context.userId,
        resource: 'prompt_template',
        details: {
          templateId,
          requestId: context.requestId,
          variableKeys: Object.keys(variables)
        }
      })

      return {
        prompt,
        systemPrompt: template.systemPrompt,
        maxTokens: context.maxTokens || template.maxTokens,
        temperature: context.temperature || template.temperature
      }
    } catch (error) {
      await this.metrics.recordError('prompt_template_render', error.message)
      throw error
    }
  }

  private async validateAndSanitizeVariables(
    templateVars: Record<string, z.infer<typeof templateVariableSchema>>,
    inputVars: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const sanitized: Record<string, unknown> = {}

    for (const [key, schema] of Object.entries(templateVars)) {
      // Check required variables
      if (schema.required && !(key in inputVars)) {
        throw new Error(`Missing required variable: ${key}`)
      }

      if (key in inputVars) {
        const value = inputVars[key]

        // Validate value type
        switch (schema.type) {
          case 'string':
            if (typeof value !== 'string') {
              throw new Error(`Variable ${key} must be a string`)
            }
            // Validate string constraints
            if (schema.maxLength && value.length > schema.maxLength) {
              throw new Error(
                `Variable ${key} exceeds maximum length of ${schema.maxLength}`
              )
            }
            if (schema.minLength && value.length < schema.minLength) {
              throw new Error(
                `Variable ${key} is shorter than minimum length of ${schema.minLength}`
              )
            }
            if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
              throw new Error(`Variable ${key} does not match required pattern`)
            }
            if (schema.enum && !schema.enum.includes(value)) {
              throw new Error(`Variable ${key} must be one of: ${schema.enum.join(', ')}`)
            }
            // Sanitize string value
            sanitized[key] = await sanitizeInput(value)
            break

          case 'number':
            if (typeof value !== 'number') {
              throw new Error(`Variable ${key} must be a number`)
            }
            sanitized[key] = value
            break

          case 'array':
            if (!Array.isArray(value)) {
              throw new Error(`Variable ${key} must be an array`)
            }
            // Sanitize array elements
            sanitized[key] = await Promise.all(
              value.map(item =>
                typeof item === 'string'
                  ? sanitizeInput(item)
                  : item
              )
            )
            break

          case 'object':
            if (typeof value !== 'object' || value === null) {
              throw new Error(`Variable ${key} must be an object`)
            }
            // Recursively sanitize object values
            sanitized[key] = await this.sanitizeObject(value as Record<string, unknown>)
            break
        }
      }
    }

    return sanitized
  }

  private async sanitizeObject(
    obj: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const sanitized: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = await sanitizeInput(value)
      } else if (Array.isArray(value)) {
        sanitized[key] = await Promise.all(
          value.map(item =>
            typeof item === 'string'
              ? sanitizeInput(item)
              : item
          )
        )
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = await this.sanitizeObject(value as Record<string, unknown>)
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  private async renderWithVariables(
    template: string,
    variables: Record<string, unknown>
  ): Promise<string> {
    // Use a secure template rendering system
    // that prevents code injection and properly escapes values
    return template.replace(
      /\{\{([^}]+)\}\}/g,
      (match, key) => {
        const value = variables[key.trim()]
        if (value === undefined) {
          throw new Error(`Undefined template variable: ${key}`)
        }
        return String(value)
      }
    )
  }

  private async checkSensitiveData(
    variables: Record<string, unknown>
  ): Promise<void> {
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /key/i,
      /token/i,
      /credential/i,
      /ssn/i,
      /social.*security/i,
      /credit.*card/i,
      /card.*number/i,
      /cvv/i,
      /banking/i,
      /account.*number/i,
    ]

    const checkValue = (value: unknown, path: string[]): void => {
      if (typeof value === 'string') {
        // Check key names for sensitive patterns
        const key = path[path.length - 1]
        if (sensitivePatterns.some(pattern => pattern.test(key))) {
          throw new Error(
            `Potential sensitive data detected in variable: ${path.join('.')}`
          )
        }

        // Check string values for common sensitive data patterns
        if (
          /^\d{3}-\d{2}-\d{4}$/.test(value) || // SSN pattern
          /^\d{4}-\d{4}-\d{4}-\d{4}$/.test(value) || // Credit card pattern
          /^\d{10,}$/.test(value) || // Long number sequence
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value) // Password pattern
        ) {
          throw new Error(
            `Potential sensitive data pattern detected in value: ${path.join('.')}`
          )
        }
      } else if (Array.isArray(value)) {
        value.forEach((item, index) =>
          checkValue(item, [...path, index.toString()])
        )
      } else if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([key, val]) =>
          checkValue(val, [...path, key])
        )
      }
    }

    Object.entries(variables).forEach(([key, value]) =>
      checkValue(value, [key])
    )
  }
} 
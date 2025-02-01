import { MetricsService } from './monitoring'
import { SecurityService } from './security'
import { z } from 'zod'

interface TemplateVariable {
  type: 'string' | 'number' | 'boolean' | 'array'
  required: boolean
  maxLength?: number
  minLength?: number
  pattern?: string
  enum?: string[]
  maxItems?: number
  itemMaxLength?: number
  description?: string
}

interface Template {
  name: string
  template: string
  variables: Record<string, TemplateVariable>
  description?: string
  version?: number
  tags?: string[]
}

const templateSchema = z.object({
  name: z.string().min(1).max(100),
  template: z.string().min(1).max(10000),
  variables: z.record(z.object({
    type: z.enum(['string', 'number', 'boolean', 'array']),
    required: z.boolean(),
    maxLength: z.number().optional(),
    minLength: z.number().optional(),
    pattern: z.string().optional(),
    enum: z.array(z.string()).optional(),
    maxItems: z.number().optional(),
    itemMaxLength: z.number().optional(),
    description: z.string().optional()
  })),
  description: z.string().optional(),
  version: z.number().optional(),
  tags: z.array(z.string()).optional()
})

export class PromptTemplateManager {
  private templates: Map<string, Template>
  private metrics: MetricsService
  private security: SecurityService

  constructor(metrics: MetricsService, security: SecurityService) {
    this.templates = new Map()
    this.metrics = metrics
    this.security = security
  }

  registerTemplate(template: Template): void {
    const startTime = Date.now()

    try {
      // Validate template structure
      const validatedTemplate = templateSchema.parse(template)

      // Check for existing template
      if (this.templates.has(template.name)) {
        throw new Error(`Template "${template.name}" already exists`)
      }

      // Store template
      this.templates.set(template.name, validatedTemplate)

      // Record metrics
      this.metrics.recordLatency(
        'template_registration',
        Date.now() - startTime
      )

      // Log audit event
      this.security.logAuditEvent({
        action: 'template_registered',
        userId: 'system',
        resource: 'prompt_template_manager',
        details: {
          templateName: template.name,
          variables: Object.keys(template.variables),
          version: template.version
        }
      })
    } catch (error) {
      this.metrics.recordError('template_registration', error.message)
      throw error
    }
  }

  private validateVariableValue(
    value: any,
    variable: TemplateVariable,
    path: string
  ): void {
    if (variable.required && (value === undefined || value === null)) {
      throw new Error(`Required variable "${path}" is missing`)
    }

    if (value === undefined || value === null) {
      return
    }

    switch (variable.type) {
      case 'string':
        if (typeof value !== 'string') {
          throw new Error(
            `Variable "${path}" must be a string, got ${typeof value}`
          )
        }
        if (variable.maxLength && value.length > variable.maxLength) {
          throw new Error(
            `Variable "${path}" exceeds maximum length of ${variable.maxLength}`
          )
        }
        if (variable.minLength && value.length < variable.minLength) {
          throw new Error(
            `Variable "${path}" is shorter than minimum length of ${variable.minLength}`
          )
        }
        if (variable.pattern && !new RegExp(variable.pattern).test(value)) {
          throw new Error(
            `Variable "${path}" does not match required pattern: ${variable.pattern}`
          )
        }
        if (variable.enum && !variable.enum.includes(value)) {
          throw new Error(
            `Variable "${path}" must be one of: ${variable.enum.join(', ')}`
          )
        }
        break

      case 'number':
        if (typeof value !== 'number') {
          throw new Error(
            `Variable "${path}" must be a number, got ${typeof value}`
          )
        }
        break

      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new Error(
            `Variable "${path}" must be a boolean, got ${typeof value}`
          )
        }
        break

      case 'array':
        if (!Array.isArray(value)) {
          throw new Error(
            `Variable "${path}" must be an array, got ${typeof value}`
          )
        }
        if (variable.maxItems && value.length > variable.maxItems) {
          throw new Error(
            `Variable "${path}" exceeds maximum items of ${variable.maxItems}`
          )
        }
        if (variable.itemMaxLength) {
          value.forEach((item, index) => {
            if (
              typeof item !== 'string' ||
              item.length > variable.itemMaxLength!
            ) {
              throw new Error(
                `Item ${index} in "${path}" exceeds maximum length of ${variable.itemMaxLength}`
              )
            }
          })
        }
        break

      default:
        throw new Error(`Unknown variable type: ${variable.type}`)
    }
  }

  async renderTemplate(
    templateName: string,
    variables: Record<string, any>
  ): Promise<string> {
    const startTime = Date.now()

    try {
      // Get template
      const template = this.templates.get(templateName)
      if (!template) {
        throw new Error(`Template "${templateName}" not found`)
      }

      // Validate variables
      Object.entries(template.variables).forEach(([name, schema]) => {
        this.validateVariableValue(variables[name], schema, name)
      })

      // Render template
      let rendered = template.template
      for (const [name, value] of Object.entries(variables)) {
        const placeholder = `{{${name}}}`
        if (Array.isArray(value)) {
          rendered = rendered.replace(
            placeholder,
            value.map(v => String(v)).join('\n- ')
          )
        } else {
          rendered = rendered.replace(placeholder, String(value))
        }
      }

      // Check for unreplaced variables
      const unreplaced = rendered.match(/{{[^}]+}}/g)
      if (unreplaced) {
        throw new Error(
          `Template contains unreplaced variables: ${unreplaced.join(', ')}`
        )
      }

      // Record metrics
      this.metrics.recordLatency(
        'template_rendering',
        Date.now() - startTime
      )

      return rendered
    } catch (error) {
      this.metrics.recordError('template_rendering', error.message)
      throw error
    }
  }

  getTemplate(name: string): Template | undefined {
    return this.templates.get(name)
  }

  listTemplates(): Template[] {
    return Array.from(this.templates.values())
  }

  deleteTemplate(name: string): boolean {
    const startTime = Date.now()

    try {
      const deleted = this.templates.delete(name)

      if (deleted) {
        // Record metrics
        this.metrics.recordLatency(
          'template_deletion',
          Date.now() - startTime
        )

        // Log audit event
        this.security.logAuditEvent({
          action: 'template_deleted',
          userId: 'system',
          resource: 'prompt_template_manager',
          details: {
            templateName: name
          }
        })
      }

      return deleted
    } catch (error) {
      this.metrics.recordError('template_deletion', error.message)
      throw error
    }
  }

  updateTemplate(name: string, updates: Partial<Template>): void {
    const startTime = Date.now()

    try {
      const existing = this.templates.get(name)
      if (!existing) {
        throw new Error(`Template "${name}" not found`)
      }

      const updated = {
        ...existing,
        ...updates,
        name, // Prevent name changes
        version: (existing.version || 0) + 1
      }

      // Validate updated template
      const validatedTemplate = templateSchema.parse(updated)

      // Store updated template
      this.templates.set(name, validatedTemplate)

      // Record metrics
      this.metrics.recordLatency(
        'template_update',
        Date.now() - startTime
      )

      // Log audit event
      this.security.logAuditEvent({
        action: 'template_updated',
        userId: 'system',
        resource: 'prompt_template_manager',
        details: {
          templateName: name,
          updatedFields: Object.keys(updates),
          newVersion: updated.version
        }
      })
    } catch (error) {
      this.metrics.recordError('template_update', error.message)
      throw error
    }
  }
} 
import { z } from 'zod'
import { MetricsService } from './metrics'
import { SecurityService } from './security'

// Validation schemas for YQL components
const fieldSchema = z.string().regex(/^[a-zA-Z0-9_]+$/)
const operatorSchema = z.enum(['=', '!=', '>', '<', '>=', '<=', 'contains', 'matches'])
const valueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.union([z.string(), z.number(), z.boolean()]))
])

const conditionSchema = z.object({
  field: fieldSchema,
  operator: operatorSchema,
  value: valueSchema
})

const orderBySchema = z.object({
  field: fieldSchema,
  direction: z.enum(['asc', 'desc'])
})

const queryOptionsSchema = z.object({
  conditions: z.array(conditionSchema),
  orderBy: z.array(orderBySchema).optional(),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
  groupBy: z.array(fieldSchema).optional()
})

export class YQLBuilder {
  private metrics: MetricsService
  private security: SecurityService

  constructor() {
    this.metrics = new MetricsService()
    this.security = new SecurityService()
  }

  /**
   * Builds a secure YQL query from validated components
   */
  buildQuery(collection: string, options: z.infer<typeof queryOptionsSchema>): string {
    const startTime = Date.now()

    try {
      // Validate collection name
      if (!/^[a-zA-Z0-9_]+$/.test(collection)) {
        throw new Error('Invalid collection name')
      }

      // Validate options
      const validatedOptions = queryOptionsSchema.parse(options)

      // Build base query
      let yql = `select * from ${collection}`

      // Add WHERE clause if conditions exist
      if (validatedOptions.conditions.length > 0) {
        yql += ' where '
        yql += validatedOptions.conditions
          .map(condition => {
            const sanitizedValue = this.sanitizeValue(condition.value)
            return `${condition.field} ${condition.operator} ${sanitizedValue}`
          })
          .join(' and ')
      }

      // Add GROUP BY clause if specified
      if (validatedOptions.groupBy?.length) {
        yql += ` group by ${validatedOptions.groupBy.join(', ')}`
      }

      // Add ORDER BY clause if specified
      if (validatedOptions.orderBy?.length) {
        yql += ' order by '
        yql += validatedOptions.orderBy
          .map(order => `${order.field} ${order.direction}`)
          .join(', ')
      }

      // Add LIMIT clause if specified
      if (validatedOptions.limit !== undefined) {
        yql += ` limit ${validatedOptions.limit}`
      }

      // Add OFFSET clause if specified
      if (validatedOptions.offset !== undefined) {
        yql += ` offset ${validatedOptions.offset}`
      }

      // Record metrics
      this.metrics.recordLatency(
        'yql_builder_duration',
        Date.now() - startTime
      )

      // Check for sensitive data patterns
      if (this.security.containsSensitiveData(yql)) {
        this.security.logSecurityEvent({
          type: 'sensitive_data_in_query',
          details: { query: yql }
        })
      }

      return yql
    } catch (error) {
      // Record error metrics
      this.metrics.recordError('yql_builder_error', error.message)
      throw error
    }
  }

  /**
   * Sanitizes a value for use in a YQL query
   */
  private sanitizeValue(value: z.infer<typeof valueSchema>): string {
    if (Array.isArray(value)) {
      return `[${value.map(v => this.sanitizeValue(v)).join(', ')}]`
    }

    switch (typeof value) {
      case 'string':
        return `"${value.replace(/["\\]/g, '\\$&')}"`
      case 'number':
        return value.toString()
      case 'boolean':
        return value.toString()
      default:
        throw new Error(`Unsupported value type: ${typeof value}`)
    }
  }

  /**
   * Helper method to build a simple equality query
   */
  buildSimpleQuery(collection: string, field: string, value: string | number): string {
    return this.buildQuery(collection, {
      conditions: [{
        field,
        operator: '=',
        value
      }]
    })
  }

  /**
   * Helper method to build a search query with multiple conditions
   */
  buildSearchQuery(collection: string, conditions: Array<z.infer<typeof conditionSchema>>): string {
    return this.buildQuery(collection, { conditions })
  }
} 
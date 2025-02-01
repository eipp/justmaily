import { z } from 'zod'

export {
  // Base schemas
  urlSchema,
  dateSchema,
  limitSchema,
  pageSchema,
  sortSchema,
  rangeSchema,
  timeframeSchema,
  
  // Filter schemas
  searchFiltersSchema,
  newsFiltersSchema,
  trendsFiltersSchema,
  
  // Request schemas
  enrichmentRequestSchema,
  searchRequestSchema,
  newsRequestSchema,
  competitorsRequestSchema,
  trendsRequestSchema,
  
  // Response schemas
  enrichmentResponseSchema,
  searchResponseSchema,
  newsResponseSchema,
  trendsResponseSchema,
} from './schemas'

// Export validation helper functions
export const validateRequest = <T>(schema: z.ZodType<T>, data: unknown): T => {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Validation error: ${error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ')}`
      )
    }
    throw error
  }
}

export const validateAsyncRequest = async <T>(
  schema: z.ZodType<T>,
  data: unknown
): Promise<T> => {
  try {
    return await schema.parseAsync(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Validation error: ${error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ')}`
      )
    }
    throw error
  }
}

// Create reusable validator functions
export const createRequestValidator = <T>(schema: z.ZodType<T>) => {
  return (data: unknown): T => validateRequest(schema, data)
}

export const createAsyncRequestValidator = <T>(schema: z.ZodType<T>) => {
  return (data: unknown): Promise<T> => validateAsyncRequest(schema, data)
} 
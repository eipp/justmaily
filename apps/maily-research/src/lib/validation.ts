import { z } from 'zod'
import { ValidationError } from './errors'

export const urlSchema = z
  .string()
  .url()
  .transform((url) => {
    try {
      return new URL(url)
    } catch {
      throw new ValidationError('Invalid URL')
    }
  })

export const emailSchema = z
  .string()
  .email()
  .transform((email) => email.toLowerCase())

export const uuidSchema = z
  .string()
  .uuid()
  .transform((uuid) => uuid.toLowerCase())

export const dateSchema = z
  .string()
  .datetime()
  .transform((date) => new Date(date))

export const limitSchema = z
  .number()
  .int()
  .min(1)
  .max(100)
  .default(10)

export const pageSchema = z
  .number()
  .int()
  .min(1)
  .default(1)

export const sortSchema = z
  .enum(['asc', 'desc'])
  .default('desc')

export const searchQuerySchema = z
  .string()
  .min(1)
  .max(500)
  .transform((query) => query.trim())

export const companySchema = z.object({
  name: z.string().min(1).max(200),
  domain: urlSchema,
  description: z.string().max(1000).optional(),
  industry: z.string().max(100).optional(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
  location: z.string().max(200).optional(),
  founded: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  linkedin: urlSchema.optional(),
  twitter: urlSchema.optional(),
  facebook: urlSchema.optional(),
  crunchbase: urlSchema.optional(),
})

export const contactSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: emailSchema,
  title: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
  linkedin: urlSchema.optional(),
  twitter: urlSchema.optional(),
  phone: z.string().max(20).optional(),
  location: z.string().max(200).optional(),
  bio: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
})

export const enrichmentRequestSchema = z.object({
  urls: z.array(urlSchema).min(1).max(100),
  options: z.object({
    includeCompanyInfo: z.boolean().default(true),
    includeContactInfo: z.boolean().default(true),
    includeSocialProfiles: z.boolean().default(true),
    includeEmployeeCount: z.boolean().default(true),
    includeTechnologies: z.boolean().default(true),
    includeMetrics: z.boolean().default(true),
  }).optional(),
})

export const searchRequestSchema = z.object({
  query: searchQuerySchema,
  filters: z.object({
    industry: z.string().optional(),
    location: z.string().optional(),
    size: z.string().optional(),
    technology: z.string().optional(),
    founded: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
  }).optional(),
  sort: z.object({
    field: z.string(),
    order: sortSchema,
  }).optional(),
  page: pageSchema,
  limit: limitSchema,
})

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid request data', error)
    }
    throw error
  }
}

export async function validateAsyncRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<T> {
  try {
    return await schema.parseAsync(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid request data', error)
    }
    throw error
  }
}

export function createRequestValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => validateRequest(schema, data)
}

export function createAsyncRequestValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => validateAsyncRequest(schema, data)
} 
import { z } from 'zod';

// Base types for API responses
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  timestamp: z.string().datetime()
});

export type ApiResponse = z.infer<typeof ApiResponseSchema>;

export const PaginationParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10)
});

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

export const PaginatedResponseSchema = ApiResponseSchema.extend({
  data: z.array(z.unknown()),
  pagination: z.object({
    currentPage: z.number(),
    totalPages: z.number(),
    totalItems: z.number(),
    hasMore: z.boolean()
  })
});

export type PaginatedResponse<T> = Omit<z.infer<typeof PaginatedResponseSchema>, 'data'> & {
  data: T[];
};

// Base types for entities
export const BaseEntitySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable()
});

export type BaseEntity = z.infer<typeof BaseEntitySchema>;

// Error types
export const ErrorDetailsSchema = z.object({
  code: z.string(),
  message: z.string(),
  field: z.string().optional(),
  details: z.record(z.unknown()).optional()
});

export type ErrorDetails = z.infer<typeof ErrorDetailsSchema>;

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: ErrorDetailsSchema,
  timestamp: z.string().datetime()
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

// Validation types
export const ValidationErrorSchema = ApiErrorSchema.extend({
  error: ErrorDetailsSchema.extend({
    code: z.literal('VALIDATION_ERROR'),
    validationErrors: z.array(z.object({
      field: z.string(),
      message: z.string(),
      code: z.string()
    }))
  })
});

export type ValidationError = z.infer<typeof ValidationErrorSchema>;

// Search types
export const SearchParamsSchema = PaginationParamsSchema.extend({
  query: z.string().min(1),
  filters: z.record(z.unknown()).optional(),
  sort: z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc'])
  }).optional()
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

// Status types
export const StatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled'
]);

export type Status = z.infer<typeof StatusSchema>; 
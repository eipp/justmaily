'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.StatusSchema =
  exports.SearchParamsSchema =
  exports.ValidationErrorSchema =
  exports.ApiErrorSchema =
  exports.ErrorDetailsSchema =
  exports.BaseEntitySchema =
  exports.PaginatedResponseSchema =
  exports.PaginationParamsSchema =
  exports.ApiResponseSchema =
    void 0;
const zod_1 = require('zod');
// Base types for API responses
exports.ApiResponseSchema = zod_1.z.object({
  success: zod_1.z.boolean(),
  message: zod_1.z.string().optional(),
  timestamp: zod_1.z.string().datetime(),
});
exports.PaginationParamsSchema = zod_1.z.object({
  page: zod_1.z.number().int().min(1).default(1),
  limit: zod_1.z.number().int().min(1).max(100).default(10),
});
exports.PaginatedResponseSchema = exports.ApiResponseSchema.extend({
  data: zod_1.z.array(zod_1.z.unknown()),
  pagination: zod_1.z.object({
    currentPage: zod_1.z.number(),
    totalPages: zod_1.z.number(),
    totalItems: zod_1.z.number(),
    hasMore: zod_1.z.boolean(),
  }),
});
// Base types for entities
exports.BaseEntitySchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  createdAt: zod_1.z.string().datetime(),
  updatedAt: zod_1.z.string().datetime(),
  deletedAt: zod_1.z.string().datetime().nullable(),
});
// Error types
exports.ErrorDetailsSchema = zod_1.z.object({
  code: zod_1.z.string(),
  message: zod_1.z.string(),
  field: zod_1.z.string().optional(),
  details: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.ApiErrorSchema = zod_1.z.object({
  success: zod_1.z.literal(false),
  error: exports.ErrorDetailsSchema,
  timestamp: zod_1.z.string().datetime(),
});
// Validation types
exports.ValidationErrorSchema = exports.ApiErrorSchema.extend({
  error: exports.ErrorDetailsSchema.extend({
    code: zod_1.z.literal('VALIDATION_ERROR'),
    validationErrors: zod_1.z.array(
      zod_1.z.object({
        field: zod_1.z.string(),
        message: zod_1.z.string(),
        code: zod_1.z.string(),
      }),
    ),
  }),
});
// Search types
exports.SearchParamsSchema = exports.PaginationParamsSchema.extend({
  query: zod_1.z.string().min(1),
  filters: zod_1.z.record(zod_1.z.unknown()).optional(),
  sort: zod_1.z
    .object({
      field: zod_1.z.string(),
      direction: zod_1.z.enum(['asc', 'desc']),
    })
    .optional(),
});
// Status types
exports.StatusSchema = zod_1.z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
]);

'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.IntegrationSchema =
  exports.WorkspaceSchema =
  exports.ProjectSchema =
  exports.TeamSchema =
  exports.OrganizationSchema =
  exports.UserSchema =
    void 0;
const zod_1 = require('zod');
const common_1 = require('../common');
// User types
exports.UserSchema = common_1.BaseEntitySchema.extend({
  email: zod_1.z.string().email(),
  name: zod_1.z.string(),
  role: zod_1.z.enum(['admin', 'user', 'guest']),
  preferences: zod_1.z
    .object({
      theme: zod_1.z.enum(['light', 'dark']).default('light'),
      notifications: zod_1.z.boolean().default(true),
      language: zod_1.z.string().default('en'),
    })
    .optional(),
});
// Organization types
exports.OrganizationSchema = common_1.BaseEntitySchema.extend({
  name: zod_1.z.string(),
  domain: zod_1.z.string(),
  settings: zod_1.z
    .object({
      maxUsers: zod_1.z.number(),
      features: zod_1.z.array(zod_1.z.string()),
      branding: zod_1.z
        .object({
          logo: zod_1.z.string().url().optional(),
          colors: zod_1.z
            .object({
              primary: zod_1.z.string(),
              secondary: zod_1.z.string(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
});
// Team types
exports.TeamSchema = common_1.BaseEntitySchema.extend({
  name: zod_1.z.string(),
  organizationId: zod_1.z.string().uuid(),
  members: zod_1.z.array(
    zod_1.z.object({
      userId: zod_1.z.string().uuid(),
      role: zod_1.z.enum(['owner', 'admin', 'member']),
    }),
  ),
});
// Project types
exports.ProjectSchema = common_1.BaseEntitySchema.extend({
  name: zod_1.z.string(),
  description: zod_1.z.string().optional(),
  teamId: zod_1.z.string().uuid(),
  status: zod_1.z.enum(['active', 'archived', 'deleted']),
  settings: zod_1.z
    .object({
      visibility: zod_1.z.enum(['public', 'private', 'team']),
      features: zod_1.z.array(zod_1.z.string()),
    })
    .optional(),
});
// Workspace types
exports.WorkspaceSchema = common_1.BaseEntitySchema.extend({
  name: zod_1.z.string(),
  projectId: zod_1.z.string().uuid(),
  type: zod_1.z.enum(['personal', 'shared']),
  settings: zod_1.z
    .object({
      defaultBranch: zod_1.z.string().default('main'),
      collaborators: zod_1.z.array(zod_1.z.string().uuid()),
      permissions: zod_1.z.object({
        read: zod_1.z.array(zod_1.z.string().uuid()),
        write: zod_1.z.array(zod_1.z.string().uuid()),
        admin: zod_1.z.array(zod_1.z.string().uuid()),
      }),
    })
    .optional(),
});
// Integration types
exports.IntegrationSchema = common_1.BaseEntitySchema.extend({
  name: zod_1.z.string(),
  type: zod_1.z.enum(['email', 'crm', 'analytics', 'other']),
  provider: zod_1.z.string(),
  config: zod_1.z.object({
    apiKey: zod_1.z.string().optional(),
    apiSecret: zod_1.z.string().optional(),
    endpoint: zod_1.z.string().url().optional(),
    settings: zod_1.z.record(zod_1.z.unknown()).optional(),
  }),
  status: zod_1.z.enum(['active', 'inactive', 'error']),
  organizationId: zod_1.z.string().uuid(),
});

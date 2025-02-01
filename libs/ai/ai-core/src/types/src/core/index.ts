import { z } from 'zod';
import { BaseEntitySchema } from '../common';

// User types
export const UserSchema = BaseEntitySchema.extend({
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['admin', 'user', 'guest']),
  preferences: z.object({
    theme: z.enum(['light', 'dark']).default('light'),
    notifications: z.boolean().default(true),
    language: z.string().default('en')
  }).optional()
});

export type User = z.infer<typeof UserSchema>;

// Organization types
export const OrganizationSchema = BaseEntitySchema.extend({
  name: z.string(),
  domain: z.string(),
  settings: z.object({
    maxUsers: z.number(),
    features: z.array(z.string()),
    branding: z.object({
      logo: z.string().url().optional(),
      colors: z.object({
        primary: z.string(),
        secondary: z.string()
      }).optional()
    }).optional()
  }).optional()
});

export type Organization = z.infer<typeof OrganizationSchema>;

// Team types
export const TeamSchema = BaseEntitySchema.extend({
  name: z.string(),
  organizationId: z.string().uuid(),
  members: z.array(z.object({
    userId: z.string().uuid(),
    role: z.enum(['owner', 'admin', 'member'])
  }))
});

export type Team = z.infer<typeof TeamSchema>;

// Project types
export const ProjectSchema = BaseEntitySchema.extend({
  name: z.string(),
  description: z.string().optional(),
  teamId: z.string().uuid(),
  status: z.enum(['active', 'archived', 'deleted']),
  settings: z.object({
    visibility: z.enum(['public', 'private', 'team']),
    features: z.array(z.string())
  }).optional()
});

export type Project = z.infer<typeof ProjectSchema>;

// Workspace types
export const WorkspaceSchema = BaseEntitySchema.extend({
  name: z.string(),
  projectId: z.string().uuid(),
  type: z.enum(['personal', 'shared']),
  settings: z.object({
    defaultBranch: z.string().default('main'),
    collaborators: z.array(z.string().uuid()),
    permissions: z.object({
      read: z.array(z.string().uuid()),
      write: z.array(z.string().uuid()),
      admin: z.array(z.string().uuid())
    })
  }).optional()
});

export type Workspace = z.infer<typeof WorkspaceSchema>;

// Integration types
export const IntegrationSchema = BaseEntitySchema.extend({
  name: z.string(),
  type: z.enum(['email', 'crm', 'analytics', 'other']),
  provider: z.string(),
  config: z.object({
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
    endpoint: z.string().url().optional(),
    settings: z.record(z.unknown()).optional()
  }),
  status: z.enum(['active', 'inactive', 'error']),
  organizationId: z.string().uuid()
});

export type Integration = z.infer<typeof IntegrationSchema>; 
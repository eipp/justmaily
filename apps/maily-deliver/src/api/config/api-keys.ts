export const apiKeyConfig = {
  prefix: 'jm_',
  hashAlgorithm: 'sha256',
  hashSalt: process.env.API_KEY_HASH_SALT || 'default_salt', // Should be set in production
  minLength: 32,
  expirationDays: 365, // Default expiration of 1 year
  rateLimit: {
    maxRequests: 1000, // Default rate limit of 1000 requests
    window: 60, // Per minute
    burstLimit: 50, // Maximum burst requests
    penaltyWindow: 300 // 5-minute penalty window for repeated violations
  },
  security: {
    maxFailedAttempts: 5, // Maximum failed validation attempts before temporary block
    blockDuration: 900, // 15-minute block after max failed attempts
    requireStrongKeys: true, // Enforce strong key requirements
    keyStrengthRequirements: {
      minEntropy: 128, // Minimum entropy bits
      allowedCharacters: '^[a-f0-9]+$', // Hexadecimal characters only
      maxAge: 365 * 24 * 60 * 60, // Maximum key age in seconds (1 year)
    },
    auditLog: {
      enabled: true,
      retentionDays: 90, // Keep audit logs for 90 days
      sensitiveFields: ['ip', 'userAgent', 'headers']
    }
  },
  permissions: {
    // Email sending permissions
    'email:send': 'Send individual emails',
    'email:send_batch': 'Send batch emails',
    'email:templates': 'Manage email templates',
    'email:validate': 'Validate email addresses',
    'email:track': 'Access email tracking data',
    
    // Analytics permissions
    'analytics:view': 'View email analytics',
    'analytics:export': 'Export analytics data',
    'analytics:reports': 'Generate analytics reports',
    'analytics:realtime': 'Access realtime analytics',
    
    // Webhook permissions
    'webhook:manage': 'Manage webhook endpoints',
    'webhook:logs': 'View webhook delivery logs',
    'webhook:retry': 'Retry failed webhooks',
    
    // API key management
    'apikey:create': 'Create new API keys',
    'apikey:revoke': 'Revoke API keys',
    'apikey:list': 'List API keys',
    'apikey:update': 'Update API key settings',
    
    // User management
    'users:manage': 'Manage user accounts',
    'users:roles': 'Manage user roles',
    'users:audit': 'View user audit logs',
    
    // System permissions
    'system:logs': 'View system logs',
    'system:metrics': 'View system metrics',
    'system:config': 'Manage system configuration',
    'system:maintenance': 'Perform maintenance operations',
    
    // Template permissions
    'template:create': 'Create email templates',
    'template:edit': 'Edit email templates',
    'template:delete': 'Delete email templates',
    'template:view': 'View email templates',
    
    // List management
    'list:create': 'Create mailing lists',
    'list:edit': 'Edit mailing lists',
    'list:delete': 'Delete mailing lists',
    'list:view': 'View mailing lists',
    
    // Campaign permissions
    'campaign:create': 'Create campaigns',
    'campaign:edit': 'Edit campaigns',
    'campaign:delete': 'Delete campaigns',
    'campaign:view': 'View campaigns',
    'campaign:schedule': 'Schedule campaigns',
    
    // Automation permissions
    'automation:create': 'Create automation workflows',
    'automation:edit': 'Edit automation workflows',
    'automation:delete': 'Delete automation workflows',
    'automation:view': 'View automation workflows',
    'automation:execute': 'Execute automation workflows'
  },
  permissionGroups: {
    'readonly': [
      'email:track',
      'analytics:view',
      'webhook:logs',
      'template:view',
      'list:view',
      'campaign:view',
      'automation:view'
    ],
    'standard': [
      'email:send',
      'email:validate',
      'analytics:view',
      'analytics:export',
      'webhook:logs',
      'template:view',
      'list:view',
      'campaign:view',
      'automation:view'
    ],
    'admin': [
      'email:send',
      'email:send_batch',
      'email:templates',
      'email:validate',
      'email:track',
      'analytics:view',
      'analytics:export',
      'analytics:reports',
      'webhook:manage',
      'webhook:logs',
      'webhook:retry',
      'apikey:create',
      'apikey:revoke',
      'apikey:list',
      'template:create',
      'template:edit',
      'template:delete',
      'template:view',
      'list:create',
      'list:edit',
      'list:delete',
      'list:view',
      'campaign:create',
      'campaign:edit',
      'campaign:delete',
      'campaign:view',
      'campaign:schedule',
      'automation:create',
      'automation:edit',
      'automation:delete',
      'automation:view',
      'automation:execute'
    ],
    'superadmin': Object.keys(this.permissions)
  }
} 
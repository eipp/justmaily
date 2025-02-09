# /libs Directory

This folder contains **shared libraries** that multiple microservices rely on.

## Subfolders

1. **ai-frameworks/**
   - Core AI integration libraries and utilities
   - Files:
     - `orchard-client.ts`: Orchestra task management wrapper
     - `swarm-manager.ts`: Swarms concurrency and coordination
     - `gemini-utils.ts`: Gemini 2.0 API helpers
     - `neum-adapters.ts`: Neum AI embedding and segmentation
     - `langchain-helpers.ts`: LangChain workflow utilities
     - `togetherai-integration.ts`: TogetherAI GPU scaling and fine-tuning

2. **shared-types/**
   - TypeScript interfaces and types used across services
   - Includes:
     - Campaign and email interfaces
     - User and workspace types
     - AI configuration types
     - Analytics and metrics types
     - Authentication and permission types

3. **shared-utils/**
   - Common utilities used across services
   - Features:
     - Logging and error handling
     - Date and time utilities
     - String manipulation
     - Validation helpers
     - Testing utilities

4. **auth-utils/**
   - Authentication and authorization utilities
   - Features:
     - JWT token management
     - Role-based access control
     - Permission validation
     - Session management
     - Security utilities

5. **compliance-tools/**
   - Tools for ensuring compliance and security
   - Features:
     - GDPR compliance checks
     - PII detection
     - Data anonymization
     - Audit logging
     - Policy enforcement

## Development Guidelines

### Library Structure
Each library follows a consistent structure:
```
library-name/
├── src/
│   ├── index.ts         # Main entry point
│   ├── types/          # Type definitions
│   ├── utils/          # Utility functions
│   └── constants/      # Shared constants
├── tests/             # Unit tests
└── package.json       # Dependencies and scripts
```

### Best Practices

1. **Code Quality**
   - Write comprehensive tests
   - Document public APIs
   - Follow TypeScript best practices
   - Use consistent code style

2. **Dependencies**
   - Minimize external dependencies
   - Keep dependencies up to date
   - Use peer dependencies when appropriate
   - Version dependencies properly

3. **Publishing**
   - Use workspace dependencies
   - Maintain semantic versioning
   - Document breaking changes
   - Update changelogs

4. **Performance**
   - Optimize for bundle size
   - Use tree-shaking friendly exports
   - Profile performance critical code
   - Cache expensive operations

### Usage Guidelines

1. **Importing Libraries**
   ```typescript
   // Use named imports
   import { logger } from '@maily/shared-utils';
   import type { Campaign } from '@maily/shared-types';
   ```

2. **Error Handling**
   ```typescript
   import { handleError } from '@maily/shared-utils';

   try {
     // Your code
   } catch (error) {
     handleError(error, 'Operation failed');
   }
   ```

3. **Authentication**
   ```typescript
   import { TokenService } from '@maily/auth-utils';

   const tokenService = new TokenService({
     accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
     refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
   });
   ```

4. **AI Framework Usage**
   ```typescript
   import { OrchardClient } from '@maily/ai-frameworks';

   const client = new OrchardClient({
     apiKey: process.env.ORCHARD_API_KEY,
     // Additional configuration
   });
   ```

### Contributing

1. **Adding New Libraries**
   - Discuss with team first
   - Follow existing patterns
   - Provide documentation
   - Include tests

2. **Updating Libraries**
   - Maintain backward compatibility
   - Update all affected services
   - Update documentation
   - Run full test suite

3. **Testing**
   ```bash
   # Run tests for all libraries
   pnpm test --filter="@maily/*"

   # Run tests for specific library
   pnpm test --filter="@maily/shared-utils"
   ```

4. **Building**
   ```bash
   # Build all libraries
   pnpm build --filter="@maily/*"

   # Build specific library
   pnpm build --filter="@maily/shared-utils"
   ``` 
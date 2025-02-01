# Development Guide

This guide outlines the steps for setting up a local development environment and contributing to the Maily project.

## Local Development Setup

1. **Clone the Repository and Install Dependencies**

   ```bash
   git clone https://github.com/yourusername/maily.git
   cd maily
   npm install
   ```

2. **Set Up Local Configuration**

   Configure your local environment variables. You can copy the example configuration file (if provided) or refer to the structure in `apps/maily-analyze/env-vars.js`.

3. **Running the Application Locally**

   Use the following commands during local development:

   - **Development Server:**

     ```bash
     npm run dev
     ```

   - **Testing:**

     ```bash
     npm test
     ```

   - **Linting:**

     ```bash
     npm run lint
     ```

## Code Guidelines

- Follow the [Code Style Guide](./code-style.md) for formatting and conventions.
- Write unit and integration tests for new features and bug fixes.
- Keep commits small and focused on individual changes.

## Contributing

- Fork the repository, create your feature branch, and open a pull request.
- Please ensure that your code passes all CI checks before submitting.

For more details, refer to our [Contributing Guidelines](./contributing.md).

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- PostgreSQL (v14 or later)
- Redis (v6 or later)
- Docker & Docker Compose
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/maily/maily.git
cd maily
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start development services:
```bash
docker-compose up -d
```

5. Run database migrations:
```bash
npm run migrate
```

6. Start development server:
```bash
npm run dev
```

## Project Structure

```
maily/
├── src/
│   ├── adapters/        # External service adapters
│   ├── providers/       # AI provider implementations
│   ├── plugins/         # Plugin system
│   ├── services/        # Core business logic
│   ├── utils/           # Utility functions
│   └── types/          # TypeScript type definitions
├── test/               # Test files
├── docs/               # Documentation
└── scripts/            # Development scripts
```

## Development Workflow

### Code Style

We follow strict TypeScript coding standards:

- Use TypeScript strict mode
- Follow ESLint configuration
- Use Prettier for formatting
- Write JSDoc comments
- Follow SOLID principles

### Git Workflow

1. Create feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make changes and commit:
```bash
git add .
git commit -m "feat: your feature description"
```

3. Push changes:
```bash
git push origin feature/your-feature-name
```

4. Create pull request

### Commit Messages

Follow Conventional Commits:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance

## Testing

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run specific test file
npm run test path/to/test

# Run tests in watch mode
npm run test:watch
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

### Test Coverage

```bash
# Generate coverage report
npm run test:coverage
```

## Debugging

### Local Development

1. Use VS Code debugger
2. Set breakpoints
3. Start debugging session

### Production Debugging

1. Enable debug logs
2. Use monitoring tools
3. Check error tracking

## Performance

### Optimization Tips

1. Use caching effectively
2. Optimize database queries
3. Implement pagination
4. Use proper indexes
5. Monitor memory usage

### Monitoring

1. Check metrics dashboard
2. Monitor error rates
3. Track response times
4. Analyze resource usage

## Security

### Best Practices

1. Keep dependencies updated
2. Follow security guidelines
3. Implement proper validation
4. Use security headers
5. Handle errors safely

### Code Review

1. Check for vulnerabilities
2. Review authentication
3. Validate authorization
4. Verify data handling
5. Test error cases

## Documentation

### Code Documentation

- Write clear comments
- Use JSDoc annotations
- Document interfaces
- Explain complex logic
- Keep docs updated

### API Documentation

- Document endpoints
- Provide examples
- Include error responses
- Show authentication
- List rate limits

## Deployment

### Development

```bash
# Build development
npm run build:dev

# Start development
npm run start:dev
```

### Production

```bash
# Build production
npm run build

# Start production
npm run start
```

### Docker

```bash
# Build image
docker build -t maily .

# Run container
docker run -p 3000:3000 maily
```

## Troubleshooting

### Common Issues

1. Database connection
2. Redis connection
3. API rate limits
4. Memory issues
5. Performance problems

### Debug Tools

1. Logging system
2. Metrics dashboard
3. Error tracking
4. Performance monitoring
5. Debug endpoints

## Contributing

### Guidelines

1. Follow code style
2. Write tests
3. Update documentation
4. Create pull request
5. Respond to reviews

### Review Process

1. Code review
2. Test verification
3. Documentation check
4. Performance review
5. Security audit 
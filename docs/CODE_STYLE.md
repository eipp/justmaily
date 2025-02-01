# Code Style Guide

This document outlines the coding standards and best practices for the Maily project.

## General Principles

- Write clean, readable, and maintainable code
- Follow SOLID principles
- Keep functions small and focused
- Use meaningful names for variables, functions, and classes
- Write self-documenting code
- Add comments only when necessary to explain complex logic

## TypeScript Guidelines

### Types and Interfaces

```typescript
// Use interfaces for objects that represent entities
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

// Use type aliases for unions, intersections, and simple types
type UserRole = 'admin' | 'user' | 'guest';
type UserWithRole = User & { role: UserRole };
```

### Naming Conventions

- Use PascalCase for class names, interfaces, and types
- Use camelCase for variables, functions, and methods
- Use UPPER_SNAKE_CASE for constants
- Prefix interfaces with 'I' only when there's a class implementing it
- Use descriptive names that reveal intent

### Functions

```typescript
// Use arrow functions for callbacks
array.map((item) => transformItem(item));

// Use function declarations for methods
function processUser(user: User): void {
  // ...
}

// Use async/await instead of raw promises
async function fetchUser(id: string): Promise<User> {
  const response = await api.get(`/users/${id}`);
  return response.data;
}
```

### Error Handling

```typescript
// Use custom error classes
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Use try-catch blocks appropriately
try {
  await processData();
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error
  } else {
    // Handle other errors
  }
}
```

## React Guidelines

### Component Structure

```typescript
// Use functional components with TypeScript
interface Props {
  user: User;
  onUpdate: (user: User) => void;
}

const UserProfile: React.FC<Props> = ({ user, onUpdate }) => {
  return (
    <div>
      <h1>{user.name}</h1>
      {/* Component content */}
    </div>
  );
};

export default UserProfile;
```

### Hooks

```typescript
// Custom hooks should start with 'use'
const useUser = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Fetch user data
  }, [userId]);
  
  return user;
};

// Keep hooks at the top level
const Component = () => {
  const [state, setState] = useState(initialState);
  const value = useContext(MyContext);
  
  // Rest of the component
};
```

### State Management

- Use React Query for server state
- Use Context + hooks for global UI state
- Keep component state minimal and focused

## API Design

### RESTful Endpoints

```typescript
// Use consistent naming
GET    /api/v1/users          // List users
GET    /api/v1/users/:id      // Get user
POST   /api/v1/users          // Create user
PUT    /api/v1/users/:id      // Update user
DELETE /api/v1/users/:id      // Delete user
```

### Response Format

```typescript
// Success response
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    // Metadata (pagination, etc.)
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      // Error details
    ]
  }
}
```

## Testing

### Unit Tests

```typescript
describe('UserService', () => {
  it('should create a new user', async () => {
    // Arrange
    const userData = {
      email: 'test@example.com',
      name: 'Test User'
    };
    
    // Act
    const result = await userService.create(userData);
    
    // Assert
    expect(result).toMatchObject(userData);
  });
});
```

### Integration Tests

- Test complete features
- Mock external dependencies
- Use realistic test data

## Documentation

### JSDoc Comments

```typescript
/**
 * Processes a user's data and returns the transformed result
 * @param user - The user object to process
 * @param options - Processing options
 * @returns The processed user data
 * @throws {ValidationError} If the user data is invalid
 */
function processUser(user: User, options: ProcessOptions): ProcessedUser {
  // Implementation
}
```

### README Files

- Keep module README files up to date
- Include setup instructions
- Document API endpoints
- List dependencies and requirements

## Git Practices

### Branches

- main: Production-ready code
- develop: Development branch
- feature/*: New features
- bugfix/*: Bug fixes
- release/*: Release preparation

### Commits

```
feat(user): add email verification
^    ^     ^
|    |     |
|    |     +-> Summary in present tense
|    +-------> Scope (optional)
+------------> Type: feat, fix, docs, style, refactor, test, or chore
```

## Performance

- Use memoization where appropriate
- Implement proper error boundaries
- Optimize bundle size
- Use lazy loading for routes and components

## Security

- Validate all inputs
- Sanitize outputs
- Use proper authentication and authorization
- Follow OWASP security guidelines
- Keep dependencies updated

## Accessibility

- Use semantic HTML
- Include proper ARIA labels
- Ensure keyboard navigation
- Maintain proper contrast ratios
- Test with screen readers 
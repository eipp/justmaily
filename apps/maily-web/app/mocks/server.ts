import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// Start the interception.
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reset handlers after each test case.
afterEach(() => server.resetHandlers());

// Clean up after all tests are done.
afterAll(() => server.close());

if (process.env.NODE_ENV === 'development') {
} 
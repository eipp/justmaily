"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("@testing-library/react");
const vitest_1 = require("vitest");
const supabase_1 = require("../supabase");
const supabase_js_1 = require("@supabase/supabase-js");
const navigation_1 = require("next/navigation");
// Mock Next.js router
vitest_1.vi.mock('next/navigation', () => ({
    useRouter: vitest_1.vi.fn(() => ({
        refresh: vitest_1.vi.fn(),
        push: vitest_1.vi.fn()
    }))
}));
// Mock Supabase client
vitest_1.vi.mock('@supabase/supabase-js', () => ({
    createClient: vitest_1.vi.fn(() => ({
        auth: {
            getSession: vitest_1.vi.fn(),
            onAuthStateChange: vitest_1.vi.fn(),
            signOut: vitest_1.vi.fn(),
            signInWithPassword: vitest_1.vi.fn(),
            signUp: vitest_1.vi.fn(),
            resetPasswordForEmail: vitest_1.vi.fn(),
            updateUser: vitest_1.vi.fn(),
            mfa: {
                enroll: vitest_1.vi.fn(),
                challenge: vitest_1.vi.fn(),
                verify: vitest_1.vi.fn(),
                unenroll: vitest_1.vi.fn(),
                listFactors: vitest_1.vi.fn()
            }
        }
    }))
}));
(0, vitest_1.describe)('SupabaseProvider', () => {
    let mockRouter;
    let mockSupabaseClient;
    (0, vitest_1.beforeEach)(() => {
        mockRouter = (0, navigation_1.useRouter)();
        mockSupabaseClient = (0, supabase_js_1.createClient)('', '');
    });
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('Authentication State', () => {
        (0, vitest_1.it)('should initialize with no session', async () => {
            vitest_1.vi.mocked(mockSupabaseClient.auth.getSession).mockResolvedValueOnce({
                data: { session: null },
                error: null
            });
            const { result } = renderHook(() => useSupabase(), {
                wrapper: ({ children }) => (<supabase_1.SupabaseProvider>{children}</supabase_1.SupabaseProvider>)
            });
            await (0, react_1.waitFor)(() => {
                (0, vitest_1.expect)(result.current.session).toBeNull();
                (0, vitest_1.expect)(result.current.user).toBeNull();
            });
        });
        (0, vitest_1.it)('should handle successful session initialization', async () => {
            const mockSession = {
                user: { id: 'user123', email: 'test@example.com' },
                access_token: 'token123',
                refresh_token: 'refresh123'
            };
            vitest_1.vi.mocked(mockSupabaseClient.auth.getSession).mockResolvedValueOnce({
                data: { session: mockSession },
                error: null
            });
            const { result } = renderHook(() => useSupabase(), {
                wrapper: ({ children }) => (<supabase_1.SupabaseProvider>{children}</supabase_1.SupabaseProvider>)
            });
            await (0, react_1.waitFor)(() => {
                (0, vitest_1.expect)(result.current.session).toEqual(mockSession);
                (0, vitest_1.expect)(result.current.user).toEqual(mockSession.user);
            });
        });
        (0, vitest_1.it)('should handle session error', async () => {
            vitest_1.vi.mocked(mockSupabaseClient.auth.getSession).mockResolvedValueOnce({
                data: { session: null },
                error: new Error('Failed to get session')
            });
            const { result } = renderHook(() => useSupabase(), {
                wrapper: ({ children }) => (<supabase_1.SupabaseProvider>{children}</supabase_1.SupabaseProvider>)
            });
            await (0, react_1.waitFor)(() => {
                (0, vitest_1.expect)(result.current.session).toBeNull();
                (0, vitest_1.expect)(result.current.user).toBeNull();
            });
        });
    });
    (0, vitest_1.describe)('Authentication Methods', () => {
        (0, vitest_1.it)('should handle sign in with password', async () => {
            const mockCredentials = {
                email: 'test@example.com',
                password: 'password123'
            };
            vitest_1.vi.mocked(mockSupabaseClient.auth.signInWithPassword).mockResolvedValueOnce({
                data: {
                    user: { id: 'user123', email: mockCredentials.email },
                    session: { access_token: 'token123' }
                },
                error: null
            });
            const { result } = renderHook(() => useSupabase(), {
                wrapper: ({ children }) => (<supabase_1.SupabaseProvider>{children}</supabase_1.SupabaseProvider>)
            });
            await (0, react_1.act)(async () => {
                await result.current.signIn(mockCredentials);
            });
            (0, vitest_1.expect)(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith(mockCredentials);
            (0, vitest_1.expect)(mockRouter.refresh).toHaveBeenCalled();
        });
        (0, vitest_1.it)('should handle sign in errors', async () => {
            const mockCredentials = {
                email: 'test@example.com',
                password: 'wrong'
            };
            vitest_1.vi.mocked(mockSupabaseClient.auth.signInWithPassword).mockResolvedValueOnce({
                data: { user: null, session: null },
                error: new Error('Invalid credentials')
            });
            const { result } = renderHook(() => useSupabase(), {
                wrapper: ({ children }) => (<supabase_1.SupabaseProvider>{children}</supabase_1.SupabaseProvider>)
            });
            await (0, react_1.act)(async () => {
                const { error } = await result.current.signIn(mockCredentials);
                (0, vitest_1.expect)(error).toBeTruthy();
                (0, vitest_1.expect)(error === null || error === void 0 ? void 0 : error.message).toBe('Invalid credentials');
            });
            (0, vitest_1.expect)(mockRouter.refresh).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)('should handle sign up', async () => {
            const mockCredentials = {
                email: 'new@example.com',
                password: 'password123'
            };
            vitest_1.vi.mocked(mockSupabaseClient.auth.signUp).mockResolvedValueOnce({
                data: {
                    user: { id: 'user123', email: mockCredentials.email },
                    session: null
                },
                error: null
            });
            const { result } = renderHook(() => useSupabase(), {
                wrapper: ({ children }) => (<supabase_1.SupabaseProvider>{children}</supabase_1.SupabaseProvider>)
            });
            await (0, react_1.act)(async () => {
                const { error } = await result.current.signUp(mockCredentials);
                (0, vitest_1.expect)(error).toBeNull();
            });
            (0, vitest_1.expect)(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith(mockCredentials);
        });
        (0, vitest_1.it)('should handle sign out', async () => {
            vitest_1.vi.mocked(mockSupabaseClient.auth.signOut).mockResolvedValueOnce({
                error: null
            });
            const { result } = renderHook(() => useSupabase(), {
                wrapper: ({ children }) => (<supabase_1.SupabaseProvider>{children}</supabase_1.SupabaseProvider>)
            });
            await (0, react_1.act)(async () => {
                await result.current.signOut();
            });
            (0, vitest_1.expect)(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
            (0, vitest_1.expect)(mockRouter.refresh).toHaveBeenCalled();
        });
    });
    (0, vitest_1.describe)('MFA Methods', () => {
        (0, vitest_1.it)('should handle MFA enrollment', async () => {
            const mockFactorId = 'totp_123';
            vitest_1.vi.mocked(mockSupabaseClient.auth.mfa.enroll).mockResolvedValueOnce({
                data: {
                    id: mockFactorId,
                    type: 'totp',
                    status: 'pending',
                    totp: {
                        qr_code: 'qr_data',
                        secret: 'secret123'
                    }
                },
                error: null
            });
            const { result } = renderHook(() => useSupabase(), {
                wrapper: ({ children }) => (<supabase_1.SupabaseProvider>{children}</supabase_1.SupabaseProvider>)
            });
            await (0, react_1.act)(async () => {
                const { data, error } = await result.current.enrollMFA();
                (0, vitest_1.expect)(error).toBeNull();
                (0, vitest_1.expect)(data).toHaveProperty('id', mockFactorId);
                (0, vitest_1.expect)(data).toHaveProperty('totp.qr_code');
            });
        });
        (0, vitest_1.it)('should handle MFA verification', async () => {
            const mockFactorId = 'totp_123';
            const mockCode = '123456';
            vitest_1.vi.mocked(mockSupabaseClient.auth.mfa.verify).mockResolvedValueOnce({
                data: {
                    id: mockFactorId,
                    type: 'totp',
                    status: 'verified'
                },
                error: null
            });
            const { result } = renderHook(() => useSupabase(), {
                wrapper: ({ children }) => (<supabase_1.SupabaseProvider>{children}</supabase_1.SupabaseProvider>)
            });
            await (0, react_1.act)(async () => {
                const { data, error } = await result.current.verifyMFA(mockFactorId, mockCode);
                (0, vitest_1.expect)(error).toBeNull();
                (0, vitest_1.expect)(data).toHaveProperty('status', 'verified');
            });
        });
        (0, vitest_1.it)('should handle MFA challenge', async () => {
            const mockFactorId = 'totp_123';
            vitest_1.vi.mocked(mockSupabaseClient.auth.mfa.challenge).mockResolvedValueOnce({
                data: {
                    id: 'challenge_123',
                    factor_id: mockFactorId,
                    expires_at: new Date(Date.now() + 300000).toISOString()
                },
                error: null
            });
            const { result } = renderHook(() => useSupabase(), {
                wrapper: ({ children }) => (<supabase_1.SupabaseProvider>{children}</supabase_1.SupabaseProvider>)
            });
            await (0, react_1.act)(async () => {
                const { data, error } = await result.current.challengeMFA(mockFactorId);
                (0, vitest_1.expect)(error).toBeNull();
                (0, vitest_1.expect)(data).toHaveProperty('factor_id', mockFactorId);
            });
        });
        (0, vitest_1.it)('should handle listing MFA factors', async () => {
            vitest_1.vi.mocked(mockSupabaseClient.auth.mfa.listFactors).mockResolvedValueOnce({
                data: {
                    all: [
                        {
                            id: 'totp_123',
                            type: 'totp',
                            status: 'verified'
                        }
                    ],
                    totp: [
                        {
                            id: 'totp_123',
                            type: 'totp',
                            status: 'verified'
                        }
                    ]
                },
                error: null
            });
            const { result } = renderHook(() => useSupabase(), {
                wrapper: ({ children }) => (<supabase_1.SupabaseProvider>{children}</supabase_1.SupabaseProvider>)
            });
            await (0, react_1.act)(async () => {
                const { data, error } = await result.current.listMFAFactors();
                (0, vitest_1.expect)(error).toBeNull();
                (0, vitest_1.expect)(data === null || data === void 0 ? void 0 : data.all).toHaveLength(1);
                (0, vitest_1.expect)(data === null || data === void 0 ? void 0 : data.totp).toHaveLength(1);
            });
        });
    });
    (0, vitest_1.describe)('Password Reset', () => {
        (0, vitest_1.it)('should handle password reset request', async () => {
            const mockEmail = 'test@example.com';
            vitest_1.vi.mocked(mockSupabaseClient.auth.resetPasswordForEmail).mockResolvedValueOnce({
                data: {},
                error: null
            });
            const { result } = renderHook(() => useSupabase(), {
                wrapper: ({ children }) => (<supabase_1.SupabaseProvider>{children}</supabase_1.SupabaseProvider>)
            });
            await (0, react_1.act)(async () => {
                const { error } = await result.current.resetPassword(mockEmail);
                (0, vitest_1.expect)(error).toBeNull();
            });
            (0, vitest_1.expect)(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(mockEmail, vitest_1.expect.any(Object));
        });
        (0, vitest_1.it)('should handle password update', async () => {
            const mockNewPassword = 'newpassword123';
            vitest_1.vi.mocked(mockSupabaseClient.auth.updateUser).mockResolvedValueOnce({
                data: { user: { id: 'user123' } },
                error: null
            });
            const { result } = renderHook(() => useSupabase(), {
                wrapper: ({ children }) => (<supabase_1.SupabaseProvider>{children}</supabase_1.SupabaseProvider>)
            });
            await (0, react_1.act)(async () => {
                const { error } = await result.current.updatePassword(mockNewPassword);
                (0, vitest_1.expect)(error).toBeNull();
            });
            (0, vitest_1.expect)(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
                password: mockNewPassword
            });
        });
    });
});

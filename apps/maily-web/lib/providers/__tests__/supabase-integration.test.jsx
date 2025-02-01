"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("@testing-library/react");
const vitest_1 = require("vitest");
const supabase_1 = require("../supabase");
const use_supabase_1 = require("../../hooks/use-supabase");
const supabase_js_1 = require("@supabase/supabase-js");
const navigation_1 = require("next/navigation");
const test_utils_1 = require("../../test/test-utils");
(0, vitest_1.describe)('Supabase Authentication Integration Tests', () => {
    let mockRouter;
    let mockSupabaseClient;
    (0, vitest_1.beforeEach)(() => {
        mockRouter = (0, navigation_1.useRouter)();
        mockSupabaseClient = (0, supabase_js_1.createClient)('', '');
    });
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('Authentication Flow', () => {
        (0, vitest_1.it)('should handle complete sign up and sign in flow with MFA', async () => {
            // 1. Sign up
            const signUpCredentials = {
                email: 'new@example.com',
                password: 'password123'
            };
            vitest_1.vi.mocked(mockSupabaseClient.auth.signUp).mockResolvedValueOnce({
                data: {
                    user: { id: 'user123', email: signUpCredentials.email },
                    session: null
                },
                error: null
            });
            const { result } = renderHook(() => (0, use_supabase_1.useSupabase)(), {
                wrapper: ({ children }) => (<supabase_1.SupabaseProvider>{children}</supabase_1.SupabaseProvider>)
            });
            await (0, react_1.act)(async () => {
                const { error } = await result.current.signUp(signUpCredentials);
                (0, vitest_1.expect)(error).toBeNull();
            });
            // 2. Sign in
            vitest_1.vi.mocked(mockSupabaseClient.auth.signInWithPassword).mockResolvedValueOnce({
                data: {
                    user: { id: 'user123', email: signUpCredentials.email },
                    session: { access_token: 'token123' }
                },
                error: null
            });
            await (0, react_1.act)(async () => {
                const { error } = await result.current.signIn(signUpCredentials);
                (0, vitest_1.expect)(error).toBeNull();
            });
            (0, vitest_1.expect)(mockRouter.refresh).toHaveBeenCalled();
            // 3. Enroll MFA
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
            await (0, react_1.act)(async () => {
                const { data, error } = await result.current.enrollMFA();
                (0, vitest_1.expect)(error).toBeNull();
                (0, vitest_1.expect)(data).toHaveProperty('id', mockFactorId);
            });
            // 4. Verify MFA
            vitest_1.vi.mocked(mockSupabaseClient.auth.mfa.verify).mockResolvedValueOnce({
                data: {
                    id: mockFactorId,
                    type: 'totp',
                    status: 'verified'
                },
                error: null
            });
            await (0, react_1.act)(async () => {
                const { data, error } = await result.current.verifyMFA(mockFactorId, '123456');
                (0, vitest_1.expect)(error).toBeNull();
                (0, vitest_1.expect)(data).toHaveProperty('status', 'verified');
            });
            // 5. Sign out
            vitest_1.vi.mocked(mockSupabaseClient.auth.signOut).mockResolvedValueOnce({
                error: null
            });
            await (0, react_1.act)(async () => {
                await result.current.signOut();
            });
            (0, vitest_1.expect)(mockRouter.refresh).toHaveBeenCalled();
        });
        (0, vitest_1.it)('should handle password reset flow', async () => {
            const email = 'test@example.com';
            const newPassword = 'newpassword123';
            // 1. Request password reset
            vitest_1.vi.mocked(mockSupabaseClient.auth.resetPasswordForEmail).mockResolvedValueOnce({
                data: {},
                error: null
            });
            const { result } = renderHook(() => (0, use_supabase_1.useSupabase)(), {
                wrapper: ({ children }) => (<supabase_1.SupabaseProvider>{children}</supabase_1.SupabaseProvider>)
            });
            await (0, react_1.act)(async () => {
                const { error } = await result.current.resetPassword(email);
                (0, vitest_1.expect)(error).toBeNull();
            });
            // 2. Update password
            vitest_1.vi.mocked(mockSupabaseClient.auth.updateUser).mockResolvedValueOnce({
                data: { user: { id: 'user123' } },
                error: null
            });
            await (0, react_1.act)(async () => {
                const { error } = await result.current.updatePassword(newPassword);
                (0, vitest_1.expect)(error).toBeNull();
            });
            // 3. Sign in with new password
            vitest_1.vi.mocked(mockSupabaseClient.auth.signInWithPassword).mockResolvedValueOnce({
                data: {
                    user: { id: 'user123', email },
                    session: { access_token: 'token123' }
                },
                error: null
            });
            await (0, react_1.act)(async () => {
                const { error } = await result.current.signIn({
                    email,
                    password: newPassword
                });
                (0, vitest_1.expect)(error).toBeNull();
            });
        });
    });
    (0, vitest_1.describe)('Session Management', () => {
        (0, vitest_1.it)('should handle session refresh', async () => {
            const mockSession = (0, test_utils_1.createMockSession)();
            // Initial session
            vitest_1.vi.mocked(mockSupabaseClient.auth.getSession).mockResolvedValueOnce({
                data: { session: mockSession },
                error: null
            });
            const { result } = renderHook(() => (0, use_supabase_1.useSupabase)(), {
                wrapper: ({ children }) => (<supabase_1.SupabaseProvider>{children}</supabase_1.SupabaseProvider>)
            });
            await (0, react_1.waitFor)(() => {
                (0, vitest_1.expect)(result.current.session).toEqual(mockSession);
            });
            // Session change
            const newSession = (0, test_utils_1.createMockSession)({
                access_token: 'new_token'
            });
            await (0, react_1.act)(async () => {
                const { event, session } = await (0, test_utils_1.waitForAuthStateChange)();
                (0, vitest_1.expect)(event).toBe('SIGNED_IN');
                (0, vitest_1.expect)(session).toEqual(newSession);
            });
        });
        (0, vitest_1.it)('should handle session expiry', async () => {
            const mockSession = (0, test_utils_1.createMockSession)({
                expires_in: 0
            });
            vitest_1.vi.mocked(mockSupabaseClient.auth.getSession).mockResolvedValueOnce({
                data: { session: mockSession },
                error: null
            });
            const { result } = renderHook(() => (0, use_supabase_1.useSupabase)(), {
                wrapper: ({ children }) => (<supabase_1.SupabaseProvider>{children}</supabase_1.SupabaseProvider>)
            });
            await (0, react_1.waitFor)(() => {
                (0, vitest_1.expect)(result.current.session).toBeNull();
            });
            (0, vitest_1.expect)(mockRouter.push).toHaveBeenCalledWith('/auth/signin');
        });
    });
    (0, vitest_1.describe)('Error Handling', () => {
        (0, vitest_1.it)('should handle authentication errors', async () => {
            const credentials = {
                email: 'test@example.com',
                password: 'wrong'
            };
            vitest_1.vi.mocked(mockSupabaseClient.auth.signInWithPassword).mockResolvedValueOnce({
                data: { user: null, session: null },
                error: (0, test_utils_1.createMockAuthError)('Invalid credentials')
            });
            const { result } = renderHook(() => (0, use_supabase_1.useSupabase)(), {
                wrapper: ({ children }) => (<supabase_1.SupabaseProvider>{children}</supabase_1.SupabaseProvider>)
            });
            await (0, react_1.act)(async () => {
                const { error } = await result.current.signIn(credentials);
                (0, vitest_1.expect)(error).toBeTruthy();
                (0, vitest_1.expect)(error === null || error === void 0 ? void 0 : error.message).toBe('Invalid credentials');
            });
            (0, vitest_1.expect)(mockRouter.refresh).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)('should handle MFA errors', async () => {
            const mockFactorId = 'totp_123';
            // MFA challenge error
            vitest_1.vi.mocked(mockSupabaseClient.auth.mfa.challenge).mockResolvedValueOnce({
                data: null,
                error: (0, test_utils_1.createMockAuthError)('Factor not found')
            });
            const { result } = renderHook(() => (0, use_supabase_1.useSupabase)(), {
                wrapper: ({ children }) => (<supabase_1.SupabaseProvider>{children}</supabase_1.SupabaseProvider>)
            });
            await (0, react_1.act)(async () => {
                const { error } = await result.current.challengeMFA(mockFactorId);
                (0, vitest_1.expect)(error).toBeTruthy();
                (0, vitest_1.expect)(error === null || error === void 0 ? void 0 : error.message).toBe('Factor not found');
            });
            // MFA verification error
            vitest_1.vi.mocked(mockSupabaseClient.auth.mfa.verify).mockResolvedValueOnce({
                data: null,
                error: (0, test_utils_1.createMockAuthError)('Invalid code')
            });
            await (0, react_1.act)(async () => {
                const { error } = await result.current.verifyMFA(mockFactorId, '123456');
                (0, vitest_1.expect)(error).toBeTruthy();
                (0, vitest_1.expect)(error === null || error === void 0 ? void 0 : error.message).toBe('Invalid code');
            });
        });
        (0, vitest_1.it)('should handle network errors', async () => {
            vitest_1.vi.mocked(mockSupabaseClient.auth.getSession).mockRejectedValueOnce(new Error('Network error'));
            const { result } = renderHook(() => (0, use_supabase_1.useSupabase)(), {
                wrapper: ({ children }) => (<supabase_1.SupabaseProvider>{children}</supabase_1.SupabaseProvider>)
            });
            await (0, react_1.waitFor)(() => {
                (0, vitest_1.expect)(result.current.session).toBeNull();
                (0, vitest_1.expect)(result.current.user).toBeNull();
            });
        });
    });
    (0, vitest_1.describe)('Concurrent Operations', () => {
        (0, vitest_1.it)('should handle multiple auth state changes', async () => {
            const mockSession1 = (0, test_utils_1.createMockSession)();
            const mockSession2 = (0, test_utils_1.createMockSession)({
                access_token: 'token2'
            });
            vitest_1.vi.mocked(mockSupabaseClient.auth.getSession)
                .mockResolvedValueOnce({
                data: { session: mockSession1 },
                error: null
            })
                .mockResolvedValueOnce({
                data: { session: mockSession2 },
                error: null
            });
            const { result } = renderHook(() => (0, use_supabase_1.useSupabase)(), {
                wrapper: ({ children }) => (<supabase_1.SupabaseProvider>{children}</supabase_1.SupabaseProvider>)
            });
            await (0, react_1.waitFor)(() => {
                (0, vitest_1.expect)(result.current.session).toEqual(mockSession1);
            });
            await (0, react_1.act)(async () => {
                const [change1, change2] = await Promise.all([
                    (0, test_utils_1.waitForAuthStateChange)(),
                    (0, test_utils_1.waitForAuthStateChange)()
                ]);
                (0, vitest_1.expect)(change1.session).not.toEqual(change2.session);
            });
        });
        (0, vitest_1.it)('should handle rapid auth method calls', async () => {
            const { result } = renderHook(() => (0, use_supabase_1.useSupabase)(), {
                wrapper: ({ children }) => (<supabase_1.SupabaseProvider>{children}</supabase_1.SupabaseProvider>)
            });
            // Multiple rapid sign-in attempts
            const signInPromises = Array.from({ length: 3 }, () => result.current.signIn({
                email: 'test@example.com',
                password: 'password123'
            }));
            vitest_1.vi.mocked(mockSupabaseClient.auth.signInWithPassword)
                .mockResolvedValueOnce({
                data: { user: null, session: null },
                error: (0, test_utils_1.createMockAuthError)('Rate limited')
            });
            await (0, react_1.act)(async () => {
                const results = await Promise.all(signInPromises);
                (0, vitest_1.expect)(results.some(r => { var _a; return ((_a = r.error) === null || _a === void 0 ? void 0 : _a.message) === 'Rate limited'; })).toBe(true);
            });
        });
    });
});

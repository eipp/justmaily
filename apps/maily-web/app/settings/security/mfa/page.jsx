"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MFASetup;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const supabase_1 = require("@/lib/providers/supabase");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const lucide_react_1 = require("lucide-react");
const qrcode_react_1 = __importDefault(require("qrcode.react"));
function MFASetup() {
    const router = (0, navigation_1.useRouter)();
    const { user, setupMFA, verifyMFA, disableMFA, getMFAFactors } = (0, supabase_1.useSupabase)();
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [success, setSuccess] = (0, react_1.useState)(false);
    const [qrCode, setQrCode] = (0, react_1.useState)(null);
    const [secret, setSecret] = (0, react_1.useState)(null);
    const [verificationCode, setVerificationCode] = (0, react_1.useState)('');
    const [hasMFA, setHasMFA] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        checkMFAStatus();
    }, []);
    const checkMFAStatus = async () => {
        try {
            const factors = await getMFAFactors();
            setHasMFA(factors.some(factor => factor.status === 'verified'));
        }
        catch (error) {
            console.error('Failed to check MFA status:', error);
        }
    };
    const handleSetupMFA = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const { secret, qrCode } = await setupMFA();
            setSecret(secret);
            setQrCode(qrCode);
        }
        catch (error) {
            setError('Failed to setup MFA');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleVerifyMFA = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await verifyMFA(verificationCode);
            setSuccess(true);
            setHasMFA(true);
            setQrCode(null);
            setSecret(null);
        }
        catch (error) {
            setError('Invalid verification code');
        }
        finally {
            setIsLoading(false);
            setVerificationCode('');
        }
    };
    const handleDisableMFA = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await disableMFA();
            setHasMFA(false);
            setSuccess(true);
        }
        catch (error) {
            setError('Failed to disable MFA');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div className="container mx-auto max-w-2xl py-8">
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
            <lucide_react_1.Shield className="h-6 w-6 text-blue-600 dark:text-blue-400"/>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Two-Factor Authentication</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Add an extra layer of security to your account
            </p>
          </div>
        </div>

        {error && (<div className="rounded-md bg-red-50 p-4 dark:bg-red-900/50">
            <div className="flex items-center">
              <lucide_react_1.AlertTriangle className="h-5 w-5 text-red-400"/>
              <p className="ml-3 text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>)}

        {success && (<div className="rounded-md bg-green-50 p-4 dark:bg-green-900/50">
            <p className="text-sm text-green-800 dark:text-green-200">
              {hasMFA
                ? 'Two-factor authentication has been enabled'
                : 'Two-factor authentication has been disabled'}
            </p>
          </div>)}

        {!hasMFA ? (<div className="space-y-6">
            {!qrCode ? (<button_1.Button onClick={handleSetupMFA} disabled={isLoading} className="w-full">
                {isLoading ? 'Setting up...' : 'Set up two-factor authentication'}
              </button_1.Button>) : (<div className="space-y-6">
                <div className="rounded-lg border p-6 dark:border-gray-800">
                  <div className="flex justify-center">
                    <qrcode_react_1.default value={qrCode} size={200}/>
                  </div>
                  <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    Scan this QR code with your authenticator app
                  </p>
                  <div className="mt-4">
                    <p className="text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                      Or enter this code manually:
                    </p>
                    <p className="mt-2 text-center font-mono text-sm">{secret}</p>
                  </div>
                </div>

                <form onSubmit={handleVerifyMFA} className="space-y-4">
                  <div>
                    <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enter verification code
                    </label>
                    <input_1.Input id="verificationCode" type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required className="mt-1" placeholder="000000" pattern="[0-9]*" maxLength={6} disabled={isLoading}/>
                  </div>

                  <button_1.Button type="submit" className="w-full" disabled={isLoading || verificationCode.length !== 6}>
                    {isLoading ? 'Verifying...' : 'Verify and enable'}
                  </button_1.Button>
                </form>
              </div>)}
          </div>) : (<div className="space-y-6">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/50">
              <p className="text-sm text-green-800 dark:text-green-200">
                Two-factor authentication is currently enabled
              </p>
            </div>

            <button_1.Button variant="destructive" onClick={handleDisableMFA} disabled={isLoading} className="w-full">
              {isLoading ? 'Disabling...' : 'Disable two-factor authentication'}
            </button_1.Button>
          </div>)}
      </div>
    </div>);
}

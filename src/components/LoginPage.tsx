import React, { useState } from 'react';
import {
  Car,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Sparkles,
  KeyRound,
  RefreshCw,
  UserPlus,
  LogIn
} from 'lucide-react';
import { UserSession } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: UserSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'staff'>('admin');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Helper to test if identifier is an email
  const isEmail = identifier.includes('@');

  // Handle Form Submit
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanId = identifier.trim();
    if (!cleanId) {
      setErrorMsg('Please enter your email address or mobile number.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    if (isRegisterMode) {
      if (!fullName.trim()) {
        setErrorMsg('Please provide your full name.');
        return;
      }
      if (password.length < 4) {
        setErrorMsg('Password should be at least 4 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter.');
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        const newUser: UserSession = {
          id: Date.now(),
          username: cleanId.split('@')[0].toLowerCase(),
          full_name: fullName.trim(),
          role: selectedRole,
          email: cleanId.includes('@') ? cleanId : undefined,
          phone: !cleanId.includes('@') ? cleanId : undefined
        };
        onLoginSuccess(newUser);
      }, 500);
      return;
    }

    // Login logic
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);

      // Recognize default demo credentials or custom logins
      const lower = cleanId.toLowerCase();
      let role: 'admin' | 'staff' = 'admin';
      let name = 'Facility Administrator';

      if (lower.includes('staff') || lower.includes('operator') || cleanId === '9123456780') {
        role = 'staff';
        name = 'Parking Operator #04';
      } else if (lower.includes('admin') || cleanId === '9876543210' || cleanId === 'admin@smartparking.com') {
        role = 'admin';
        name = 'System Administrator';
      } else {
        name = cleanId.includes('@') ? cleanId.split('@')[0] : `Operator (${cleanId.slice(-4)})`;
      }

      const session: UserSession = {
        id: role === 'admin' ? 1 : 2,
        username: cleanId.split('@')[0],
        full_name: name,
        role: role,
        email: cleanId.includes('@') ? cleanId : undefined,
        phone: !cleanId.includes('@') ? cleanId : undefined
      };

      if (rememberMe) {
        try {
          localStorage.setItem('smart_parking_auth', JSON.stringify(session));
        } catch {
          // ignore
        }
      }

      onLoginSuccess(session);
    }, 450);
  };

  // Quick Demo Login click
  const handleQuickDemo = (type: 'admin' | 'staff') => {
    setErrorMsg('');
    if (type === 'admin') {
      setIdentifier('admin@smartparking.com');
      setPassword('admin123');
      setSelectedRole('admin');
    } else {
      setIdentifier('9123456780');
      setPassword('staff123');
      setSelectedRole('staff');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Logo & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 items-center justify-center shadow-lg shadow-blue-600/30 mb-3 ring-4 ring-blue-500/10">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Smart Parking System
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isRegisterMode ? 'Operator & Gatekeeper Registration' : 'Control Deck & Operator Authentication'}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              !isRegisterMode
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              isRegisterMode
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Operator</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {/* Full Name field (Register only) */}
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email or Mobile Number Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                <span>Email or Mobile Number *</span>
              </label>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                {isEmail ? 'Email Mode' : 'Mobile / Phone Mode'}
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                {isEmail ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
              </div>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. admin@smartparking.com or 9876543210"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-mono"
              />
            </div>
          </div>

          {/* Role selector (Register only) */}
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Designated Access Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors ${
                    selectedRole === 'admin'
                      ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Administrator</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('staff')}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors ${
                    selectedRole === 'staff'
                      ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Parking Staff</span>
                </button>
              </div>
            </div>
          )}

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Password *</label>
              {!isRegisterMode && (
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter account password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Register only) */}
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Remember Me Checkbox */}
          {!isRegisterMode && (
            <div className="flex items-center">
              <label className="flex items-center space-x-2 cursor-pointer select-none text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500/20"
                />
                <span>Remember this terminal session</span>
              </label>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying Credentials...</span>
                </>
              ) : isRegisterMode ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account & Sign In</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Terminal</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Demo Credentials Switcher */}
        {!isRegisterMode && (
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
              <span>Quick Demo Test Accounts:</span>
              <span className="text-[10px] text-blue-400 font-mono">1-Click Fill</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 text-left transition-all group"
              >
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-200">Admin</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                  admin@smartparking.com
                </div>
                <div className="text-[10px] text-slate-600 font-mono">pass: admin123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('staff')}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
              >
                <div className="flex items-center space-x-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-200">Staff / Operator</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                  📱 9123456780
                </div>
                <div className="text-[10px] text-slate-600 font-mono">pass: staff123</div>
              </button>
            </div>
          </div>
        )}

        {/* Footer Security Badge */}
        <div className="mt-6 pt-4 border-t border-slate-800/60 text-center">
          <p className="text-[10px] text-slate-500 flex items-center justify-center space-x-1">
            <Lock className="w-3 h-3 text-slate-500" />
            <span>Authorized Parking Personnel • 256-Bit SSL Secured</span>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center space-x-2 text-white font-bold text-sm mb-2">
              <KeyRound className="w-4 h-4 text-blue-400" />
              <span>Password Recovery</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Enter your registered email address or mobile number to receive a temporary recovery OTP or reset link.
            </p>

            {forgotSubmitted ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                  ✅ Password reset code dispatched to <strong className="text-white font-mono">{forgotInput}</strong>. Default temporary pass: <span className="font-mono text-emerald-400 font-bold">admin123</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSubmitted(false);
                    setForgotInput('');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter email or 10-digit mobile number"
                  value={forgotInput}
                  onChange={e => setForgotInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!forgotInput.trim()) return;
                      setForgotSubmitted(true);
                    }}
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                  >
                    Send Reset Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

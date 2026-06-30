'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/axios';
import OtpInput from '@/components/features/OtpInput';
import { useToast } from '@/components/ui/Toast';

const appName = 'Zerofx.club';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15, 'Phone too long'),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Signup state
  const [signupStep, setSignupStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Password state for step 3
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const startResendTimer = useCallback(() => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // --- LOGIN FLOW ---
  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', {
        email: loginEmail,
        password: loginPassword
      });
      
      showSuccess('Login successful!');
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      showError(error.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // --- SIGNUP FLOW ---
  const onSendOtp = async (data: SignupForm) => {
    setLoading(true);
    try {
      await api.post('/api/auth/send-otp', data);
      setEmail(data.email);
      setUserName(data.fullName);
      setSignupStep(2);
      startResendTimer();
      showSuccess('OTP sent to your email!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      showError(error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (code: string) => {
    setLoading(true);
    try {
      await api.post('/api/auth/verify-otp', { email, code });
      showSuccess('Email verified! Please create a password.');
      setSignupStep(3);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      showError(error.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const onSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/set-password', { password: newPassword });
      showSuccess('Account created successfully!');
      
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      showError(error.response?.data?.error || 'Failed to set password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      await api.post('/api/auth/send-otp', { fullName: userName, email, phone: '0000000000' });
      startResendTimer();
      showSuccess('OTP resent!');
    } catch {
      showError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/20 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{appName}</h1>
          <p className="text-slate-500 mt-1">
            {activeTab === 'login' ? 'Welcome back' : signupStep === 1 ? 'Create your account' : signupStep === 2 ? 'Verify your email' : 'Set your password'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 overflow-hidden relative">
          
          {/* Tabs - Only show when logging in or at step 1 of signup */}
          {(activeTab === 'login' || signupStep === 1) && (
            <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={onLogin} className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
          ) : (
            <div className="animate-fade-in">
              {signupStep === 1 && (
                <form onSubmit={handleSignupSubmit(onSendOtp)} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      {...registerSignup('fullName')}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        signupErrors.fullName ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
                      } focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm`}
                    />
                    {signupErrors.fullName && (
                      <p className="text-red-500 text-xs mt-1.5">{signupErrors.fullName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      {...registerSignup('email')}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        signupErrors.email ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
                      } focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm`}
                    />
                    {signupErrors.email && (
                      <p className="text-red-500 text-xs mt-1.5">{signupErrors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      {...registerSignup('phone')}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        signupErrors.phone ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
                      } focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm`}
                    />
                    {signupErrors.phone && (
                      <p className="text-red-500 text-xs mt-1.5">{signupErrors.phone.message}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                  >
                    {loading ? 'Sending OTP...' : 'Continue with OTP'}
                  </button>
                </form>
              )}

              {signupStep === 2 && (
                <div className="animate-fade-in">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-600">We sent a 6-digit code to</p>
                    <p className="font-semibold text-slate-900 mt-1">{email}</p>
                  </div>
                  <OtpInput length={6} onComplete={onVerifyOtp} disabled={loading} />
                  
                  {loading && (
                    <div className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-500">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Verifying...
                    </div>
                  )}
                  <div className="mt-8 text-center">
                    <button
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0 || loading}
                      className="text-sm text-blue-600 hover:text-blue-700 disabled:text-slate-400 font-medium transition-colors"
                    >
                      {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </div>
                  <button onClick={() => setSignupStep(1)} className="mt-4 w-full text-center text-sm text-slate-500 hover:text-slate-700">
                    ← Back
                  </button>
                </div>
              )}

              {signupStep === 3 && (
                <form onSubmit={onSetPassword} className="space-y-5 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Create a Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    />
                    <p className="text-xs text-slate-500 mt-2">Must be at least 6 characters.</p>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || newPassword.length < 6}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                  >
                    {loading ? 'Saving...' : 'Finish & Log In'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

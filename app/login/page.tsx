'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, Phone, User, Lock, ArrowRight } from 'lucide-react';
import api from '@/lib/axios';
import OtpInput from '@/components/features/OtpInput';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';

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
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-50 selection:bg-blue-200 selection:text-blue-900 overflow-hidden">
      
      <div className="w-full max-w-md relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{appName}</h1>
          <p className="text-slate-600 mt-2 font-medium">
            {activeTab === 'login' ? 'Welcome back, trader' : signupStep === 1 ? 'Start your trading journey' : signupStep === 2 ? 'Verify your identity' : 'Secure your account'}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-xl relative border border-slate-200 overflow-hidden"
        >
          {/* Subtle inner glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          {/* Tabs */}
          {(activeTab === 'login' || signupStep === 1) && (
            <div className="flex p-1 bg-slate-100/50 rounded-xl mb-8 border border-slate-200 relative z-10 shadow-inner">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 relative ${
                  activeTab === 'login' ? 'text-blue-700' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {activeTab === 'login' && (
                  <motion.div layoutId="auth-tab" className="absolute inset-0 bg-white rounded-lg border border-slate-200 shadow-sm" />
                )}
                <span className="relative z-10">Log In</span>
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 relative ${
                  activeTab === 'signup' ? 'text-blue-700' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {activeTab === 'signup' && (
                  <motion.div layoutId="auth-tab" className="absolute inset-0 bg-white rounded-lg border border-slate-200 shadow-sm" />
                )}
                <span className="relative z-10">Sign Up</span>
              </button>
            </div>
          )}

          <div className="relative z-10">
            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.form 
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={onLogin} 
                  className="space-y-5"
                >
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="trader@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm shadow-sm"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full mt-6 shadow-md"
                    loading={loading}
                  >
                    Access Platform
                  </Button>
                </motion.form>
              ) : (
                <motion.div 
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {signupStep === 1 && (
                    <form onSubmit={handleSignupSubmit(onSendOtp)} className="space-y-5">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            placeholder="John Doe"
                            {...registerSignup('fullName')}
                            className={`w-full pl-10 pr-4 py-3 bg-white rounded-xl border text-slate-900 placeholder-slate-400 transition-all text-sm shadow-sm ${
                              signupErrors.fullName ? 'border-red-500/50 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500/50 focus:border-blue-500/50'
                            } focus:outline-none focus:ring-2`}
                          />
                        </div>
                        {signupErrors.fullName && (
                          <p className="text-red-500 text-xs ml-1 mt-1 font-medium">{signupErrors.fullName.message}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            type="email"
                            placeholder="john@example.com"
                            {...registerSignup('email')}
                            className={`w-full pl-10 pr-4 py-3 bg-white rounded-xl border text-slate-900 placeholder-slate-400 transition-all text-sm shadow-sm ${
                              signupErrors.email ? 'border-red-500/50 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500/50 focus:border-blue-500/50'
                            } focus:outline-none focus:ring-2`}
                          />
                        </div>
                        {signupErrors.email && (
                          <p className="text-red-500 text-xs ml-1 mt-1 font-medium">{signupErrors.email.message}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Phone Number</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            type="tel"
                            placeholder="9876543210"
                            {...registerSignup('phone')}
                            className={`w-full pl-10 pr-4 py-3 bg-white rounded-xl border text-slate-900 placeholder-slate-400 transition-all text-sm shadow-sm ${
                              signupErrors.phone ? 'border-red-500/50 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500/50 focus:border-blue-500/50'
                            } focus:outline-none focus:ring-2`}
                          />
                        </div>
                        {signupErrors.phone && (
                          <p className="text-red-500 text-xs ml-1 mt-1 font-medium">{signupErrors.phone.message}</p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full mt-6 shadow-md"
                        loading={loading}
                      >
                        Continue with OTP <ArrowRight className="w-5 h-5 ml-1" />
                      </Button>
                    </form>
                  )}

                  {signupStep === 2 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="animate-fade-in"
                    >
                      <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 border border-blue-100 mb-4 shadow-sm">
                          <Mail className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-sm text-slate-500 font-medium">We sent a secure code to</p>
                        <p className="font-bold text-slate-900 mt-1 text-lg">{email}</p>
                      </div>
                      
                      {/* OTP Input Container */}
                      <div className="flex justify-center mb-6">
                        <OtpInput length={6} onComplete={onVerifyOtp} disabled={loading} />
                      </div>
                      
                      <div className="mt-8 text-center space-y-4">
                        <button
                          onClick={handleResendOtp}
                          disabled={resendTimer > 0 || loading}
                          className="text-sm text-blue-600 hover:text-blue-700 disabled:text-slate-400 font-semibold transition-colors"
                        >
                          {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                        </button>
                        <button 
                          onClick={() => setSignupStep(1)} 
                          className="block w-full text-center text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
                        >
                          ← Back to details
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {signupStep === 3 && (
                    <form onSubmit={onSetPassword} className="space-y-5 animate-fade-in">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Create a Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm shadow-sm"
                          />
                        </div>
                        <p className="text-xs text-slate-500 font-medium ml-1 mt-2">Must be at least 6 characters.</p>
                      </div>
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full mt-6 shadow-md"
                        disabled={newPassword.length < 6}
                        loading={loading}
                      >
                        Finish & Enter <ArrowRight className="w-5 h-5 ml-1" />
                      </Button>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

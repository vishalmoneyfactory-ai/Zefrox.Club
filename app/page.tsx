'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { ShieldCheck, LineChart, Zap, HeadphonesIcon, ArrowRight, Check, Smartphone, MonitorPlay } from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const appName = 'Zerofx.club';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060a14] text-slate-200 selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden font-sans">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Navy Blue Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-[20%] right-[-20%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] mix-blend-screen" />
        {/* Noise overlay for texture */}
        <div className="absolute inset-0 opacity-[0.015] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-[#060a14]/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-white/10">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">{appName}</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link href="/login" className="hidden sm:block text-slate-300 hover:text-white font-medium transition-colors">
                Sign In
              </Link>
              <Link 
                href="/login" 
                className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 hover:text-white border border-blue-500/30 px-6 py-2.5 rounded-full font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)] flex items-center group"
              >
                Trade Now
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-16">
        
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[85vh] flex flex-col justify-center">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-left space-y-8 max-w-2xl"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 backdrop-blur-md rounded-full px-4 py-2 shadow-inner">
                <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="text-sm font-semibold text-blue-300 tracking-wide uppercase">Next-Gen Trading Platform</span>
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
                Master the Markets <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 filter drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">With Precision.</span>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-slate-400 leading-relaxed font-medium max-w-lg">
                Experience lightning-fast execution, military-grade security, and institutional-grade analytics—all wrapped in a sleek, transparent navy glass interface.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link 
                  href="/login" 
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center group"
                >
                  Start Trading
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="flex items-center justify-center sm:justify-start px-4 text-slate-400 font-medium space-x-2">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  <span>Secure & Encrypted</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content - Abstract Dashboard Preview */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full mix-blend-screen"></div>
              
              <div className="relative bg-[#0b1221]/80 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-6 overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                
                {/* Mockup Header */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                  </div>
                  <div className="h-6 w-24 bg-white/5 rounded-full"></div>
                </div>

                {/* Mockup Content */}
                <div className="space-y-4">
                  <div className="h-32 bg-gradient-to-br from-blue-600/20 to-indigo-900/20 rounded-2xl border border-white/5 p-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
                    <div className="h-4 w-1/3 bg-white/10 rounded mb-2"></div>
                    <div className="h-8 w-1/2 bg-white/20 rounded"></div>
                    {/* Simulated chart line */}
                    <svg className="absolute bottom-0 left-0 w-full h-1/2 text-blue-500/50" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <path d="M0,100 L0,50 Q25,70 50,40 T100,20 L100,100 Z" fill="currentColor" />
                      <path d="M0,50 Q25,70 50,40 T100,20" fill="none" stroke="url(#gradient)" strokeWidth="3" className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#818cf8" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-[#111827]/60 rounded-2xl border border-white/5 p-4 flex flex-col justify-between hover:bg-[#111827]/80 transition-colors">
                       <div className="h-3 w-1/2 bg-white/10 rounded"></div>
                       <div className="h-6 w-3/4 bg-blue-500/20 rounded"></div>
                    </div>
                    <div className="h-24 bg-[#111827]/60 rounded-2xl border border-white/5 p-4 flex flex-col justify-between hover:bg-[#111827]/80 transition-colors">
                       <div className="h-3 w-1/2 bg-white/10 rounded"></div>
                       <div className="h-6 w-3/4 bg-emerald-500/20 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Why Trade With Us?</h2>
            <p className="text-slate-400 font-medium">Built for speed, reliability, and precision. Everything you need to succeed in the modern markets.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#0b1221]/60 backdrop-blur-xl rounded-3xl p-8 border border-white/5 hover:bg-[#0b1221]/80 hover:border-blue-500/30 transition-all group shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LineChart className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Pro Analytics</h3>
              <p className="text-slate-400 leading-relaxed font-medium">
                Access advanced charting tools and real-time market data to make informed trading decisions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#0b1221]/60 backdrop-blur-xl rounded-3xl p-8 border border-white/5 hover:bg-[#0b1221]/80 hover:border-blue-500/30 transition-all group shadow-[0_8px_30px_rgba(0,0,0,0.3)] relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                <ShieldCheck className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">Ironclad Security</h3>
              <p className="text-slate-400 leading-relaxed font-medium relative z-10">
                Your funds and data are protected by military-grade encryption and multi-factor authentication.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#0b1221]/60 backdrop-blur-xl rounded-3xl p-8 border border-white/5 hover:bg-[#0b1221]/80 hover:border-blue-500/30 transition-all group shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <HeadphonesIcon className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">24/7 Support</h3>
              <p className="text-slate-400 leading-relaxed font-medium">
                Our dedicated team of experts is available around the clock to assist you with any questions.
              </p>
            </div>
          </div>
        </section>

      </main>
      
      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#060a14] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black text-white">{appName}</span>
            </div>
            
            <div className="flex gap-8 text-sm font-semibold text-slate-400">
              <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
            </div>

            <p className="text-sm text-slate-500 font-medium">
              © {new Date().getFullYear()} {appName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import Button from '@/components/ui/Button';

const appName = 'Zerofx.club';

export default function AboutPage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#060a14] text-slate-200 selection:bg-blue-500/30 selection:text-blue-200 font-sans">
      
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
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed w-full z-50 top-0 transition-all duration-300 bg-[#060a14]/60 backdrop-blur-xl border-b border-white/5 flex flex-col"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center justify-start gap-3">
              <span className="text-2xl font-black tracking-tighter text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">{appName}</span>
            </div>
            
            <div className="hidden md:flex items-center justify-center space-x-8">
              <Link href="/" className="text-slate-400 font-medium hover:text-white transition-colors pb-1">Home</Link>
              <Link href="/about" className="text-blue-400 font-semibold transition-colors border-b-2 border-blue-500 pb-1">About Us</Link>
            </div>

            <div className="flex items-center justify-end">
              <Link href="/login">
                <Button variant="primary" size="sm" className="shadow-[0_0_15px_rgba(59,130,246,0.15)] border border-blue-500/30">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* About Us Content */}
      <section className="py-24 sm:py-32 relative z-10 pt-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-sm font-bold tracking-widest text-blue-500 uppercase mb-3">About Us</h2>
              <h3 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight drop-shadow-sm">
                Empowering Traders with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Next-Gen</span> Execution
              </h3>
              <div className="space-y-6 text-slate-400 text-lg leading-relaxed font-medium">
                <p>
                  At {appName}, we believe that every trader deserves institutional-grade access to the global financial markets. Built by traders for traders, our platform is engineered to deliver lightning-fast execution, ultra-tight spreads, and an environment completely free from artificial limitations.
                </p>
                <p>
                  Whether you are navigating the high-liquidity Forex markets, exploring the volatile world of Cryptocurrencies, or diversifying with global Indices and Commodities, we provide the robust infrastructure necessary for you to trade with absolute confidence.
                </p>
                <p>
                  With a commitment to transparency, security, and round-the-clock dedicated support, our mission is to remain your trusted partner in navigating the complexities of modern trading.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square md:aspect-auto md:h-[500px] rounded-[2rem] bg-[#0b1221]/80 backdrop-blur-2xl p-10 flex flex-col justify-between relative overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="space-y-10 relative z-10">
                  <div>
                    <h4 className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">12.4k+</h4>
                    <p className="text-blue-400 font-semibold mt-2 text-lg">Active Traders globally</p>
                  </div>
                  <div>
                    <h4 className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">200+</h4>
                    <p className="text-indigo-400 font-semibold mt-2 text-lg">Tradable Instruments</p>
                  </div>
                  <div>
                    <h4 className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">&lt;10ms</h4>
                    <p className="text-blue-300 font-semibold mt-2 text-lg">Average Execution Speed</p>
                  </div>
                </div>
                <div className="mt-10 pt-8 border-t border-white/10 relative z-10">
                  <p className="text-slate-400 italic font-medium leading-relaxed">
                    "The latency and spread on XAU/USD are unmatched. {appName} has completely transformed my day-trading strategy."
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#060a14] relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">{appName}</span>
            </div>
            
            <div className="flex gap-8 text-sm font-semibold text-slate-400">
              <Link href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-blue-400 transition-colors">Terms of Service</Link>
            </div>

            <p className="text-sm text-slate-500 font-medium">
              &copy; {new Date().getFullYear()} {appName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

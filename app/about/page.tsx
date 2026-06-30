'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import Button from '@/components/ui/Button';

const appName = 'Zerofx.club';

export default function AboutPage() {
  return (
    <div className="min-h-screen relative overflow-hidden selection:bg-aurora-cyan/30 selection:text-aurora-cyan">
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-50 glass border-b border-white/5 flex flex-col"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center justify-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-cyan to-aurora-indigo flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">{appName}</span>
            </div>
            
            <div className="hidden md:flex items-center justify-center space-x-8">
              <Link href="/" className="text-slate-400 font-medium hover:text-white transition-colors pb-1">Home</Link>
              <Link href="/about" className="text-aurora-cyan font-semibold transition-colors border-b-2 border-aurora-cyan pb-1">About Us</Link>
            </div>

            <div className="flex items-center justify-end">
              <Link href="/login">
                <Button variant="glow" size="sm">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* About Us Content */}
      <section className="py-24 sm:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-sm font-bold tracking-widest text-aurora-cyan uppercase mb-3">About Us</h2>
              <h3 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight drop-shadow-sm">
                Empowering Traders with <span className="gradient-text">Next-Gen</span> Execution
              </h3>
              <div className="space-y-6 text-slate-300 text-lg leading-relaxed font-medium">
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
              <div className="aspect-square md:aspect-auto md:h-[500px] rounded-[2rem] glass-card p-10 flex flex-col justify-between relative overflow-hidden border-aurora-indigo/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-aurora-cyan/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="space-y-10 relative z-10">
                  <div>
                    <h4 className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">12.4k+</h4>
                    <p className="text-aurora-cyan font-semibold mt-2 text-lg">Active Traders globally</p>
                  </div>
                  <div>
                    <h4 className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">200+</h4>
                    <p className="text-aurora-indigo font-semibold mt-2 text-lg">Tradable Instruments</p>
                  </div>
                  <div>
                    <h4 className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">&lt;10ms</h4>
                    <p className="text-aurora-purple font-semibold mt-2 text-lg">Average Execution Speed</p>
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
      <footer className="border-t border-white/5 bg-slate-950/50 backdrop-blur-lg absolute bottom-0 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-cyan to-aurora-indigo flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black text-white">{appName}</span>
            </div>
            
            <div className="flex gap-8 text-sm font-medium text-slate-400">
              <a href="#" className="hover:text-aurora-cyan transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-aurora-cyan transition-colors">Terms of Service</a>
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

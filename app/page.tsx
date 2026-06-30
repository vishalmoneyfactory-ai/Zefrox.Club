'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { ShieldCheck, LineChart, Zap, HeadphonesIcon, ArrowRight } from 'lucide-react';
import TickerTape from '@/components/features/TickerTape';
import MiniChart from '@/components/features/MiniChart';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const appName = 'Zerofx.club';

const features = [
  {
    icon: <LineChart className="w-8 h-8 text-aurora-cyan" />,
    title: 'Ultra-Low Spreads',
    description: 'on XAU EUR',
  },
  {
    icon: <Zap className="w-8 h-8 text-aurora-cyan" />,
    title: '200+ Instruments',
    description: 'Forex, Crypto & More',
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-aurora-cyan" />,
    title: '$40 Minimum',
    description: 'Start with just $40',
  },
  {
    icon: <HeadphonesIcon className="w-8 h-8 text-aurora-cyan" />,
    title: '24/7 Support',
    description: 'Round-the-clock assistance',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function LandingPage() {
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
              <Link href="/" className="text-aurora-cyan font-semibold transition-colors border-b-2 border-aurora-cyan pb-1">Home</Link>
              <Link href="/about" className="text-slate-400 font-medium hover:text-white transition-colors pb-1">About Us</Link>
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

      {/* Hero Section */}
      <header className="relative pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Ticker Tape */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full glass-card h-[44px] relative z-20 rounded-xl overflow-hidden mb-16 shadow-[0_0_30px_rgba(34,211,238,0.1)]"
          >
            <TickerTape />
          </motion.div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            
            {/* Left Content */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="flex-1 text-center lg:text-left z-10"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-aurora-cyan/30 text-aurora-cyan text-sm font-semibold mb-8 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                <ShieldCheck className="w-4 h-4" />
                Trusted by 12,400+ Traders
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-tight">
                Trade Smarter<br className="hidden sm:block" />
                <span className="gradient-text drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]"> Trade Faster</span>
              </motion.h1>

              <motion.p variants={itemVariants} className="text-lg sm:text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Claim your 100% deposit bonus and join the ultimate futuristic trading platform built for low latency and extreme liquidity.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/login">
                  <Button variant="glow" size="lg" className="w-full sm:w-auto">
                    Start Trading <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Learn More
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Content (Mini Chart) */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex-1 w-full max-w-lg lg:max-w-xl z-10"
            >
              <div className="glass-card p-4 h-[350px] relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-aurora-cyan to-aurora-purple rounded-[20px] blur opacity-20"></div>
                <div className="relative h-full w-full rounded-xl overflow-hidden">
                  <MiniChart />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 relative border-y border-white/5 bg-slate-900/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Why Choose <span className="text-aurora-cyan">{appName}</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              A complete trading solution engineered with next-gen technology to give you the competitive edge.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card hover glow className="h-full text-center group">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto mb-6 group-hover:bg-aurora-cyan/10 transition-colors duration-300 shadow-inner">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 font-medium">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2rem] glass-card px-8 py-16 sm:px-16 sm:py-24 text-center border-aurora-indigo/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-aurora-cyan/10 via-aurora-indigo/10 to-aurora-purple/10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 drop-shadow-md">
                Ready to Get Started?
              </h2>
              <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
                Join our secure {appName} platform today. Quick registration, instant KYC verification, and lightning-fast execution.
              </p>
              <Link href="/login">
                <Button variant="glow" size="lg">
                  Create Your Account
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950/50 backdrop-blur-lg">
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

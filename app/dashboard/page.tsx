'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { LineChart, Zap, ShieldCheck, HeadphonesIcon, ArrowRight } from 'lucide-react';
import TickerTape from '@/components/features/TickerTape';
import MiniChart from '@/components/features/MiniChart';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const appName = 'Zerofx.club';

const features = [
  {
    icon: <LineChart className="w-6 h-6 text-aurora-cyan" />,
    title: 'Ultra-Low Spreads',
    description: 'on XAU EUR',
  },
  {
    icon: <Zap className="w-6 h-6 text-aurora-cyan" />,
    title: '200+ Instruments',
    description: 'Forex, Crypto & More',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-aurora-cyan" />,
    title: '$40 Minimum',
    description: 'Start with just $40',
  },
  {
    icon: <HeadphonesIcon className="w-6 h-6 text-aurora-cyan" />,
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

export default function DashboardHome() {
  return (
    <div className="flex-1 w-full relative overflow-hidden selection:bg-aurora-cyan/30 selection:text-aurora-cyan">
      
      {/* Ticker Tape */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full glass-card h-[44px] shadow-sm relative z-20 rounded-xl overflow-hidden mt-2 mb-8 border-white/5"
      >
        <TickerTape />
      </motion.div>

      <div className="max-w-7xl mx-auto py-4 sm:py-6 relative z-10">
        
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-16">
          {/* Left Content */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex-1 text-center lg:text-left"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-aurora-cyan/30 text-aurora-cyan text-sm font-semibold mb-6 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <Zap className="w-4 h-4" />
              Welcome back to {appName}
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
              Manage Your <br className="hidden sm:block" />
              <span className="gradient-text">Portfolio</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg text-slate-400 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
              Your account is active. Manage your payments, track your history, and experience execution built for low latency.
            </motion.p>

            <motion.div variants={itemVariants}>
              <Link href="/dashboard/history">
                <Button variant="glow" size="lg" className="w-full sm:w-auto">
                  View Payment History
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Content (Mini Chart) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 w-full max-w-lg lg:max-w-xl"
          >
            <div className="glass-card p-4 h-[350px] relative rounded-2xl border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
               <div className="absolute -inset-1 bg-gradient-to-r from-aurora-cyan to-aurora-indigo rounded-[20px] blur opacity-10"></div>
               <div className="relative h-full w-full rounded-xl overflow-hidden">
                 <MiniChart />
               </div>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-black text-white mb-8 drop-shadow-sm">Platform Capabilities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} hover glow className="text-center group border-white/5 bg-slate-900/40">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-white/5 flex items-center justify-center mx-auto mb-4 group-hover:bg-aurora-cyan/10 transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 font-medium">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}

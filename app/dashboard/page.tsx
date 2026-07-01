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
    icon: <LineChart className="w-6 h-6 text-blue-600" />,
    title: 'Ultra-Low Spreads',
    description: 'on XAU EUR',
  },
  {
    icon: <Zap className="w-6 h-6 text-blue-600" />,
    title: '200+ Instruments',
    description: 'Forex, Crypto & More',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
    title: '$40 Minimum',
    description: 'Start with just $40',
  },
  {
    icon: <HeadphonesIcon className="w-6 h-6 text-blue-600" />,
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
    <div className="flex-1 w-full relative overflow-hidden selection:bg-blue-200 selection:text-blue-900">
      
      {/* Ticker Tape */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white/70 backdrop-blur-xl h-[44px] shadow-sm relative z-20 rounded-xl overflow-hidden -mt-3 mb-8 border border-slate-200"
      >
        <TickerTape theme="light" />
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
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/80 border border-blue-200 text-blue-700 text-sm font-semibold mb-6 shadow-sm">
              <Zap className="w-4 h-4" />
              Welcome back to {appName}
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
              Manage Your <br className="hidden sm:block" />
              <span className="gradient-text">Trading Account</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
              Your account is active. Manage your payments, track your history, and experience execution built for low latency.
            </motion.p>

            <motion.div variants={itemVariants}>
              <Link href="/dashboard/history">
                <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md">
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
            <div className="bg-white/80 backdrop-blur-xl p-4 h-[350px] relative rounded-2xl border border-slate-200 shadow-xl">
               <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-[20px] blur opacity-20"></div>
               <div className="relative h-full w-full rounded-xl overflow-hidden bg-white">
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
          <h2 className="text-2xl font-black text-slate-900 mb-8 drop-shadow-sm">Platform Capabilities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} hover glow className="text-center group border-slate-200 bg-white/70 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
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

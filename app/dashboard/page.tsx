'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { LineChart, Zap, ShieldCheck, HeadphonesIcon, ArrowRight, Check, Smartphone, MonitorPlay } from 'lucide-react';
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

const accountTypes = [
  {
    name: 'Standard',
    desc: 'Start trading with standard account',
    deposit: '$40',
    features: ['Instant credit', 'No hidden fees', 'Trade Immediately', 'Deposit & Withdrawal in 2 minutes', 'MT5'],
    popular: false,
  },
  {
    name: 'Premium',
    desc: 'Advanced features for serious traders',
    deposit: '$100',
    features: ['100% deposit bonus', 'Priority support', 'Advanced analytics', 'Lower spreads', 'Deposit & Withdrawal in 2 minutes', 'MT5'],
    popular: true,
  },
  {
    name: 'Platinum',
    desc: 'Premium trading experience with exclusive benefits',
    deposit: '$500',
    features: ['100% deposit bonus', 'Personal account manager', 'VIP support', 'Exclusive market insights', 'Deposit & Withdrawal in 2 minutes', 'MT5'],
    popular: false,
  }
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
    <div className="flex-1 w-full relative selection:bg-blue-200 selection:text-blue-900">
      
      {/* Ticker Tape */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-xl min-h-[72px] sm:min-h-[44px] shadow-sm relative z-20 -mt-4 sm:-mt-6 lg:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 mb-8 border-b border-slate-200"
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
                 <MiniChart symbol="OANDA:EURUSD" theme="light" />
               </div>
            </div>
          </motion.div>
        </div>

        {/* Live Market Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16 pt-8 border-t border-slate-200/50"
        >
          <h2 className="text-2xl font-black text-slate-900 mb-8 drop-shadow-sm">Live <span className="text-blue-600">Market Overview</span></h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-sm p-4 h-[400px] relative rounded-2xl">
              <div className="relative h-full w-full rounded-xl overflow-hidden bg-white">
                 <MiniChart symbol="OANDA:EURUSD" theme="light" />
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-sm p-4 h-[400px] relative rounded-2xl">
              <div className="relative h-full w-full rounded-xl overflow-hidden bg-white">
                 <MiniChart symbol="OANDA:XAUUSD" theme="light" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account Types Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16 pt-8 border-t border-slate-200/50"
        >
           <div className="mb-8">
             <h2 className="text-2xl font-black text-slate-900 mb-2 drop-shadow-sm">Account <span className="text-blue-600">Types</span></h2>
             <p className="text-slate-500 font-medium">Choose the account that fits your trading style</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {accountTypes.map((acc, index) => (
               <div
                 key={acc.name}
                 className={`relative bg-white/70 backdrop-blur-xl rounded-2xl p-6 flex flex-col transition-all duration-300 ${acc.popular ? 'border-blue-300 shadow-[0_8px_30px_rgba(59,130,246,0.15)] scale-105 z-10' : 'border border-slate-200 shadow-sm hover:shadow-md'}`}
               >
                 {acc.popular && (
                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-md">
                     Most Popular
                   </div>
                 )}
                 <div className="mb-4">
                   <h3 className={`text-xl font-black mb-1 ${acc.popular ? 'text-blue-700' : 'text-slate-800'}`}>{acc.name}</h3>
                   <p className="text-xs text-slate-500 h-8">{acc.desc}</p>
                 </div>
                 
                 <div className="flex justify-between items-center py-3 border-y border-slate-100 mb-4">
                   <span className="text-slate-500 text-sm font-semibold">Min Deposit</span>
                   <span className="text-lg font-black text-blue-600">{acc.deposit}</span>
                 </div>

                 <ul className="space-y-3 mb-6 flex-1">
                   {acc.features.map((feature, i) => (
                     <li key={i} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                       <Check className="w-4 h-4 text-green-500 shrink-0" />
                       <span>{feature}</span>
                     </li>
                   ))}
                 </ul>

                 <div className="mt-auto">
                   <Button variant={acc.popular ? 'primary' : 'secondary'} className="w-full shadow-sm">
                     Current Plan
                   </Button>
                 </div>
               </div>
             ))}
           </div>
        </motion.div>

        {/* Features Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16 pt-8 border-t border-slate-200/50"
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

        {/* Download Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="pt-8 border-t border-slate-200/50"
        >
           <div className="mb-10">
             <h2 className="text-2xl font-black text-slate-900">Download Our <span className="text-blue-600">Trading Platform</span></h2>
           </div>
           <div className="flex flex-col md:flex-row items-center justify-between gap-12 max-w-5xl mx-auto">
             <div className="flex-1 w-full bg-white/70 backdrop-blur-xl border border-slate-200 p-8 rounded-2xl shadow-sm">
               <h3 className="text-xl font-bold text-slate-800 mb-6">Trade Anywhere, Anytime</h3>
               <ul className="space-y-4">
                 {[
                   'Real-time market data',
                   'Advanced charting tools',
                   'Secure trading environment',
                   '24/7 customer support'
                 ].map((item, i) => (
                   <li key={i} className="flex items-center gap-3">
                     <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                       <Check className="w-3.5 h-3.5 text-blue-600" />
                     </div>
                     <span className="text-slate-600 font-medium text-sm">{item}</span>
                   </li>
                 ))}
               </ul>
             </div>

             <div className="flex-1 w-full text-center md:text-left flex flex-col items-center md:items-start">
               <h3 className="text-xl font-bold text-slate-800 mb-2">Get Started Today</h3>
               <p className="text-slate-500 font-medium text-sm mb-8">Download our app and start trading in minutes</p>
               
               <div className="flex flex-col gap-4 w-full max-w-[240px]">
                 <a href="#" className="flex items-center gap-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all rounded-xl p-3 text-white shadow-md">
                   <MonitorPlay className="w-7 h-7" />
                   <div className="flex flex-col items-start leading-tight">
                     <span className="text-[9px] text-slate-300 font-medium">GET IT ON</span>
                     <span className="text-base font-semibold">Google Play</span>
                   </div>
                 </a>
                 <a href="#" className="flex items-center gap-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all rounded-xl p-3 text-white shadow-md">
                   <Smartphone className="w-7 h-7" />
                   <div className="flex flex-col items-start leading-tight">
                     <span className="text-[9px] text-slate-300 font-medium">Download on the</span>
                     <span className="text-base font-semibold">App Store</span>
                   </div>
                 </a>
               </div>
               <p className="text-xs text-slate-400 mt-6 text-center md:text-left w-full max-w-[240px] font-medium">
                 Available on Google Play and App Store
               </p>
             </div>
           </div>
        </motion.div>
        
      </div>
    </div>
  );
}

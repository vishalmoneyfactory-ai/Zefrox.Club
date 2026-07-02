'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { ShieldCheck, LineChart, Zap, HeadphonesIcon, ArrowRight, Check, Smartphone, MonitorPlay } from 'lucide-react';
import TickerTape from '@/components/features/TickerTape';
import MiniChart from '@/components/features/MiniChart';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const appName = 'Zerofx.club';

const features = [
  {
    icon: <LineChart className="w-8 h-8 text-blue-600" />,
    title: 'Ultra-Low Spreads',
    description: 'on XAU EUR',
  },
  {
    icon: <Zap className="w-8 h-8 text-blue-600" />,
    title: '200+ Instruments',
    description: 'Forex, Crypto & More',
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-blue-600" />,
    title: '$40 Minimum',
    description: 'Start with just $40',
  },
  {
    icon: <HeadphonesIcon className="w-8 h-8 text-blue-600" />,
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

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 selection:bg-blue-200 selection:text-blue-900">
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200 flex flex-col shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center justify-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900">{appName}</span>
            </div>

            <div className="flex items-center justify-end">
              <Link href="/login">
                <Button variant="primary" size="sm">
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
            className="w-full bg-white/80 backdrop-blur-xl border border-slate-200 min-h-[44px] relative z-20 rounded-xl overflow-hidden mb-16 shadow-sm"
          >
            <TickerTape theme="light" />
          </motion.div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            
            {/* Left Content */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="flex-1 text-center lg:text-left z-10"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold mb-8 shadow-sm">
                <ShieldCheck className="w-4 h-4" />
                Trusted by 12,400+ Traders
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
                Trade Smarter<br className="hidden sm:block" />
                <span className="gradient-text"> Trade Faster</span>
              </motion.h1>

              <motion.p variants={itemVariants} className="text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                Claim your 100% deposit bonus and join the ultimate futuristic trading platform built for low latency and extreme liquidity.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/login">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md">
                    Start Trading <ArrowRight className="w-5 h-5 ml-2" />
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
              <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-4 h-[350px] relative rounded-2xl shadow-xl">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-[20px] blur opacity-20"></div>
                <div className="relative h-full w-full rounded-xl overflow-hidden bg-white">
                  <MiniChart symbol="OANDA:EURUSD" theme="light" />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </header>

      {/* Live Market Overview */}
      <section className="py-24 relative border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 drop-shadow-sm">
              Live <span className="text-blue-600">Market Overview</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-sm p-4 h-[400px] relative rounded-2xl"
            >
              <div className="relative h-full w-full rounded-xl overflow-hidden bg-white">
                 <MiniChart symbol="OANDA:EURUSD" theme="light" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-sm p-4 h-[400px] relative rounded-2xl"
            >
              <div className="relative h-full w-full rounded-xl overflow-hidden bg-white">
                 <MiniChart symbol="OANDA:XAUUSD" theme="light" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Account Types Section */}
      <section className="py-24 relative border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
           >
             <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 drop-shadow-sm">Account <span className="text-blue-600">Types</span></h2>
             <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">Choose the account that fits your trading style</p>
           </motion.div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
             {accountTypes.map((acc, index) => (
               <motion.div
                 key={acc.name}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: index * 0.1 }}
                 className={`relative bg-white/70 backdrop-blur-xl rounded-2xl p-8 flex flex-col transition-all duration-300 ${acc.popular ? 'border-blue-300 shadow-[0_8px_30px_rgba(59,130,246,0.15)] scale-105 z-10' : 'border border-slate-200 shadow-sm hover:shadow-md'}`}
               >
                 {acc.popular && (
                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs uppercase tracking-wider font-bold px-4 py-1.5 rounded-full shadow-lg">
                     Most Popular
                   </div>
                 )}
                 <div className="text-center mb-6">
                   <h3 className={`text-2xl font-black mb-2 ${acc.popular ? 'text-blue-700' : 'text-slate-800'}`}>{acc.name}</h3>
                   <p className="text-sm text-slate-500 h-10 font-medium">{acc.desc}</p>
                 </div>
                 
                 <div className="flex justify-between items-center py-4 border-y border-slate-100 mb-6">
                   <span className="text-slate-500 font-semibold">Min Deposit</span>
                   <span className="text-xl font-black text-blue-600">{acc.deposit}</span>
                 </div>

                 <ul className="space-y-4 mb-8 flex-1">
                   {acc.features.map((feature, i) => (
                     <li key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                       <Check className="w-5 h-5 text-green-500 shrink-0" />
                       <span>{feature}</span>
                     </li>
                   ))}
                 </ul>

                 <Link href="/login" className="mt-auto">
                   <Button variant={acc.popular ? 'primary' : 'secondary'} className="w-full shadow-sm">
                     Trade Now
                   </Button>
                 </Link>
               </motion.div>
             ))}
           </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 drop-shadow-sm">
              Why Choose <span className="text-blue-600">{appName}</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
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
                <Card hover glow className="h-full text-center group border-slate-200 bg-white/70 shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 font-medium">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-24 relative border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
           >
             <h2 className="text-3xl sm:text-4xl font-black text-slate-900 drop-shadow-sm">Download Our <span className="text-blue-600">Trading Platform</span></h2>
           </motion.div>
           <div className="flex flex-col md:flex-row items-center justify-center gap-16 max-w-4xl mx-auto">
             <motion.div 
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="flex-1 w-full bg-white/70 backdrop-blur-xl border border-slate-200 p-8 rounded-2xl shadow-sm"
             >
               <h3 className="text-2xl font-bold text-slate-800 mb-6">Trade Anywhere, Anytime</h3>
               <ul className="space-y-5">
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
                     <span className="text-slate-600 font-medium">{item}</span>
                   </li>
                 ))}
               </ul>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, x: 30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="flex-1 w-full text-center md:text-left flex flex-col items-center md:items-start"
             >
               <h3 className="text-2xl font-bold text-slate-800 mb-2">Get Started Today</h3>
               <p className="text-slate-500 font-medium mb-8">Download our app and start trading in minutes</p>
               
               <div className="flex flex-col gap-4 w-full max-w-[240px]">
                 <a href="#" className="flex items-center gap-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all rounded-xl p-3 text-white shadow-md">
                   <MonitorPlay className="w-8 h-8" />
                   <div className="flex flex-col items-start leading-tight">
                     <span className="text-[10px] text-slate-300 font-medium">GET IT ON</span>
                     <span className="text-lg font-semibold">Google Play</span>
                   </div>
                 </a>
                 <a href="#" className="flex items-center gap-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all rounded-xl p-3 text-white shadow-md">
                   <Smartphone className="w-8 h-8" />
                   <div className="flex flex-col items-start leading-tight">
                     <span className="text-[10px] text-slate-300 font-medium">Download on the</span>
                     <span className="text-lg font-semibold">App Store</span>
                   </div>
                 </a>
               </div>
               <p className="text-xs text-slate-400 mt-6 text-center md:text-left w-full max-w-[240px] font-medium">
                 Available on Google Play and App Store
               </p>
             </motion.div>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black text-slate-900">{appName}</span>
            </div>
            
            <div className="flex gap-8 text-sm font-semibold text-slate-500">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            </div>

            <p className="text-sm text-slate-400 font-medium">
              © {new Date().getFullYear()} {appName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

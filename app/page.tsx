'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ShieldCheck, LineChart, Zap, HeadphonesIcon, ArrowRight, Check, Smartphone, MonitorPlay, Menu, X } from 'lucide-react';
import TickerTape from '@/components/features/TickerTape';
import MiniChart from '@/components/features/MiniChart';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import api from '@/lib/axios';

const appName = 'Zerofx.club';

const features = [
  {
    icon: <LineChart className="w-8 h-8 text-blue-500" />,
    title: 'Ultra-Low Spreads',
    description: 'on XAU EUR',
  },
  {
    icon: <Zap className="w-8 h-8 text-blue-500" />,
    title: '200+ Instruments',
    description: 'Forex, Crypto & More',
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-blue-500" />,
    title: '$40 Minimum',
    description: 'Start with just $40',
  },
  {
    icon: <HeadphonesIcon className="w-8 h-8 text-blue-500" />,
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
    name: 'Platinum',
    desc: 'Advanced features for serious traders',
    deposit: '$100',
    features: ['100% deposit bonus', 'Priority support', 'Advanced analytics', 'Lower spreads', 'Deposit & Withdrawal in 2 minutes', 'MT5'],
    popular: false,
  },
  {
    name: 'Premium',
    desc: 'Premium trading experience with exclusive benefits',
    deposit: '$500',
    features: ['100% deposit bonus', 'Personal account manager', 'VIP support', 'Exclusive market insights', 'Deposit & Withdrawal in 2 minutes', 'MT5'],
    popular: true,
  },
  {
    name: 'Platinum +',
    desc: 'The ultimate trading experience for VIPs',
    deposit: '$1000',
    features: ['100% deposit bonus', 'Dedicated account manager', '24/7 VIP support', 'Premium market insights', 'Deposit & Withdrawal in 2 minutes', 'MT5'],
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    api.get('/api/users/me')
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false));
  }, []);

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
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed w-full z-50 top-0 transition-all duration-300 bg-[#060a14]/60 backdrop-blur-xl border-b border-white/5 flex flex-col"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center justify-start gap-3">
              <span className="text-xl sm:text-2xl font-black tracking-tighter text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">{appName}</span>
            </div>
            
            <div className="hidden md:flex items-center justify-center space-x-8">
              <Link href="/" className="text-blue-400 font-semibold transition-colors border-b-2 border-blue-500 pb-1">Home</Link>
              <Link href="/about" className="text-slate-400 font-medium hover:text-white transition-colors pb-1">About Us</Link>
            </div>

            <div className="flex items-center gap-3">
              <Link href={isLoggedIn ? "/accounts" : "/login"}>
                <Button variant="primary" size="sm" className="shadow-[0_0_15px_rgba(59,130,246,0.15)] border border-blue-500/30">
                  {isLoggedIn ? "Accounts" : "Sign In"}
                </Button>
              </Link>
              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-white/10 bg-[#060a14]/90 backdrop-blur-xl"
            >
              <div className="flex flex-col px-4 py-4 gap-2">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-blue-400 font-bold bg-blue-500/10 border border-blue-500/20">Home</Link>
                <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-slate-300 font-semibold hover:bg-white/5 transition-colors">About Us</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <header className="relative pt-24 pb-16 sm:pt-32 sm:pb-32 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Ticker Tape */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full bg-[#0b1221]/80 backdrop-blur-2xl border border-white/10 min-h-[44px] relative z-20 rounded-xl overflow-hidden mb-16 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            <TickerTape theme="dark" />
          </motion.div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            
            {/* Left Content */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="flex-1 text-center lg:text-left z-10"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md text-blue-400 text-sm font-semibold mb-8 shadow-inner">
                <ShieldCheck className="w-4 h-4" />
                Trusted by 12,400+ Traders
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-tight">
                Trade Smarter<br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 filter drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]"> Trade Faster</span>
              </motion.h1>

              <motion.p variants={itemVariants} className="text-lg sm:text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                Claim your 100% deposit bonus and join the ultimate futuristic trading platform built for low latency and extreme liquidity.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href={isLoggedIn ? "/accounts" : "/login"}>
                  <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                    {isLoggedIn ? 'Go to Accounts' : 'Start Trading'} <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-[#111827]/60 hover:bg-[#111827]/80 text-white border border-white/10">
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
              className="flex-1 w-full max-w-lg lg:max-w-xl z-10 mt-8 lg:mt-0"
            >
              <div className="bg-[#0b1221]/80 backdrop-blur-2xl border border-white/10 p-4 h-[350px] relative rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[2rem] blur opacity-10"></div>
                <div className="relative h-full w-full rounded-xl overflow-hidden bg-[#060a14]/50 border border-white/5">
                  <MiniChart symbol="OANDA:EURUSD" theme="dark" />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </header>

      {/* Live Market Overview */}
      <section className="py-24 relative border-t border-white/5 bg-[#0b1221]/40 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Live <span className="text-blue-500">Market Overview</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-[#0b1221]/60 backdrop-blur-xl border border-white/5 p-4 h-[400px] relative rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
            >
              <div className="relative h-full w-full rounded-xl overflow-hidden bg-[#060a14]/50">
                 <MiniChart symbol="OANDA:EURUSD" theme="dark" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-[#0b1221]/60 backdrop-blur-xl border border-white/5 p-4 h-[400px] relative rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
            >
              <div className="relative h-full w-full rounded-xl overflow-hidden bg-[#060a14]/50">
                 <MiniChart symbol="OANDA:XAUUSD" theme="dark" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Account Types Section */}
      <section className="py-24 relative border-t border-white/5 bg-[#0b1221]/60 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
           >
             <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Account <span className="text-blue-500">Types</span></h2>
             <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">Choose the account that fits your trading style</p>
           </motion.div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-2">
             {accountTypes.map((acc, index) => (
               <motion.div
                 key={acc.name}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: index * 0.1 }}
                 className={`relative bg-[#060a14]/80 backdrop-blur-xl border rounded-3xl p-6 sm:p-8 flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.3)] ${acc.popular ? 'border-blue-500/50 scale-105 z-10' : 'border-white/5'}`}
               >
                 {acc.popular && (
                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                     Most Popular
                   </div>
                 )}
                 <div className="text-center mb-6">
                   <h3 className={`text-2xl font-black mb-2 ${acc.popular ? 'text-blue-400' : 'text-white'}`}>{acc.name}</h3>
                   <p className="text-sm text-slate-400 h-10 font-medium">{acc.desc}</p>
                 </div>
                 
                 <div className="flex justify-between items-center py-4 border-y border-white/10 mb-6">
                   <span className="text-slate-300 font-semibold">Min Deposit</span>
                   <span className="text-xl font-bold text-blue-400">{acc.deposit}</span>
                 </div>

                 <ul className="space-y-4 mb-8 flex-1">
                   {acc.features.map((feature, i) => (
                     <li key={i} className="flex items-start gap-3 text-sm text-slate-300 font-medium">
                       <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                       <span>{feature}</span>
                     </li>
                   ))}
                 </ul>

                 <Link href={isLoggedIn ? "/accounts" : "/login"} className="mt-auto">
                   <Button variant="primary" className={`w-full ${acc.popular ? 'shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-500/50' : 'bg-[#111827]/60 hover:bg-[#111827]/80 border border-white/10'}`}>
                     {isLoggedIn ? 'Go to Accounts' : 'Trade Now'}
                   </Button>
                 </Link>
               </motion.div>
             ))}
           </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative border-t border-white/5 bg-[#0b1221]/40 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Why Choose <span className="text-blue-500">{appName}</span>
            </h2>
            <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">
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
                <div className="bg-[#0b1221]/60 backdrop-blur-xl border border-white/5 hover:border-blue-500/30 hover:bg-[#0b1221]/80 h-full text-center group rounded-[2rem] p-6 sm:p-8 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 font-medium">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-24 relative border-t border-white/5 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
           >
             <h2 className="text-3xl sm:text-4xl font-black text-white">Download Our <span className="text-blue-500">Trading Platform</span></h2>
           </motion.div>
           <div className="flex flex-col md:flex-row items-center justify-center gap-16 max-w-4xl mx-auto">
             <motion.div 
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="flex-1 w-full bg-[#0b1221]/60 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
             >
               <h3 className="text-2xl font-bold text-white mb-6">Trade Anywhere, Anytime</h3>
               <ul className="space-y-5">
                 {[
                   'Real-time market data',
                   'Advanced charting tools',
                   'Secure trading environment',
                   '24/7 customer support'
                 ].map((item, i) => (
                   <li key={i} className="flex items-center gap-3">
                     <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50">
                       <Check className="w-3.5 h-3.5 text-blue-400" />
                     </div>
                     <span className="text-slate-300 font-medium">{item}</span>
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
               <h3 className="text-2xl font-bold text-white mb-2">Get Started Today</h3>
               <p className="text-slate-400 font-medium mb-8">Download our app and start trading in minutes</p>
               
               <div className="flex flex-col gap-4 w-full max-w-[240px]">
                 <a href="#" className="flex items-center gap-4 bg-[#111827]/80 border border-white/10 hover:border-white/30 hover:bg-[#111827] transition-all rounded-xl p-3 text-white">
                   <MonitorPlay className="w-8 h-8 text-blue-400" />
                   <div className="flex flex-col items-start leading-tight">
                     <span className="text-[10px] text-slate-400 font-medium">GET IT ON</span>
                     <span className="text-lg font-semibold">Google Play</span>
                   </div>
                 </a>
                 <a href="#" className="flex items-center gap-4 bg-[#111827]/80 border border-white/10 hover:border-white/30 hover:bg-[#111827] transition-all rounded-xl p-3 text-white">
                   <Smartphone className="w-8 h-8 text-blue-400" />
                   <div className="flex flex-col items-start leading-tight">
                     <span className="text-[10px] text-slate-400 font-medium">Download on the</span>
                     <span className="text-lg font-semibold">App Store</span>
                   </div>
                 </a>
               </div>
               <p className="text-xs text-slate-500 font-medium mt-6 text-center md:text-left w-full max-w-[240px]">
                 Available on Google Play and App Store
               </p>
             </motion.div>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 relative border-t border-white/5 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2.5rem] bg-[#0b1221]/80 backdrop-blur-2xl border border-blue-500/20 px-8 py-16 sm:px-16 sm:py-24 text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-blue-500/5"></div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 drop-shadow-md">
                Ready to Get Started?
              </h2>
              <p className="text-lg sm:text-xl text-slate-300 font-medium max-w-2xl mx-auto mb-10">
                Join our secure {appName} platform today. Quick registration, instant KYC verification, and lightning-fast execution.
              </p>
              <Link href={isLoggedIn ? "/accounts" : "/login"}>
                <Button variant="primary" size="lg" className="shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-blue-500/50">
                  {isLoggedIn ? 'View Your Accounts' : 'Create Your Account'}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#060a14] relative z-10">
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

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ShieldCheck, LineChart, Zap, HeadphonesIcon, ArrowRight, Check, Smartphone, MonitorPlay, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import TickerTape from '@/components/features/TickerTape';
import MiniChart from '@/components/features/MiniChart';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import api from '@/lib/axios';

const appName = 'Zerofx.club';

const features = [
  {
    icon: <LineChart className="w-8 h-8 text-indigo-500" />,
    title: 'Ultra-Low Spreads',
    description: 'on XAU EUR',
  },
  {
    icon: <Zap className="w-8 h-8 text-violet-500" />,
    title: '200+ Instruments',
    description: 'Forex, Crypto & More',
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-indigo-500" />,
    title: '$40 Minimum',
    description: 'Start with just $40',
  },
  {
    icon: <HeadphonesIcon className="w-8 h-8 text-violet-500" />,
    title: '24/7 Support',
    description: 'Round-the-clock assistance',
  },
];

const accountTypes = [
  {
    name: 'Standard',
    desc: 'Start trading with standard account',
    deposit: '$40',
    features: ['Instant credit', 'No hidden fees', 'Trade Immediately', 'Deposit in 2 mins, Withdrawal in 2-3 hrs', 'MT5'],
    popular: false,
  },
  {
    name: 'Platinum',
    desc: 'Advanced features for serious traders',
    deposit: '$100',
    features: ['100% deposit bonus', 'Priority support', 'Advanced analytics', 'Lower spreads', 'Deposit in 2 mins, Withdrawal in 30-40 mins', 'MT5'],
    popular: false,
  },
  {
    name: 'Premium',
    desc: 'Premium trading experience with exclusive benefits',
    deposit: '$500',
    features: ['100% deposit bonus', 'Personal account manager', 'VIP support', 'Exclusive market insights', 'Deposit in 2 mins, Withdrawal in 1-2 hrs', 'MT5'],
    popular: true,
  },
  {
    name: 'Platinum +',
    desc: 'The ultimate trading experience for VIPs',
    deposit: '$1000',
    features: ['100% deposit bonus', 'Dedicated account manager', '24/7 VIP support', 'Premium market insights', 'Deposit in 2 mins, Withdrawal in 5-10 mins', 'MT5'],
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    api.get('/api/users/me')
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false));
  }, []);

  return (
    <div className="min-h-screen text-slate-700 selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Light gradient orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-300/30 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[-20%] w-[60%] h-[60%] bg-violet-300/25 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-purple-200/20 rounded-full blur-[100px]" />
        <div className="absolute top-[50%] left-[30%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-[80px]" />
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed w-full z-50 top-0 navbar-light flex flex-col bg-white/70 backdrop-blur-xl border-b border-slate-200/80 transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center justify-start gap-3">
              <span className="text-xl sm:text-2xl font-black tracking-tighter gradient-text bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">{appName}</span>
            </div>
            
            <div className="hidden md:flex items-center justify-center space-x-8">
              <Link href="/" className="text-indigo-600 font-semibold transition-colors border-b-2 border-indigo-500 pb-1">Home</Link>
              <Link href="/about" className="text-slate-600 font-medium hover:text-indigo-600 transition-colors pb-1">About Us</Link>
            </div>

            <div className="flex items-center gap-3">
              <Link href={isLoggedIn ? "/accounts" : "/login"}>
                <Button variant="primary" size="sm" className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-[0_4px_14px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.55)] border-0">
                  {isLoggedIn ? "Accounts" : "Sign In"}
                </Button>
              </Link>
              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
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
              className="md:hidden overflow-hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl"
            >
              <div className="flex flex-col px-4 py-4 gap-2">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-indigo-600 font-bold bg-indigo-50 border border-indigo-200">Home</Link>
                <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-indigo-50 hover:text-indigo-600 transition-colors">About Us</Link>
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
            className="w-full bg-white/80 backdrop-blur-2xl border border-slate-200 min-h-[44px] relative z-20 rounded-xl overflow-hidden mb-16 shadow-md"
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
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-600 text-sm font-semibold mb-8">
                <ShieldCheck className="w-4 h-4" />
                Trusted by 12,400+ Traders
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
                Trade Smarter<br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-600"> Trade Faster</span>
              </motion.h1>

              <motion.p variants={itemVariants} className="text-lg sm:text-xl text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                Claim your 100% deposit bonus and join the ultimate futuristic trading platform built for low latency and extreme liquidity.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href={isLoggedIn ? "/accounts" : "/login"}>
                  <Button variant="primary" size="lg" className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-[0_4px_14px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.55)] border-0">
                    {isLoggedIn ? 'Go to Accounts' : 'Start Trading'} <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-white/80 hover:bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-all">
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
              <div className="bg-white/80 backdrop-blur-2xl border border-slate-200 p-4 h-[350px] relative rounded-[2rem] shadow-[0_20px_60px_rgba(99,102,241,0.12)]">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 to-violet-500 rounded-[2rem] blur opacity-10"></div>
                <div className="relative h-full w-full rounded-xl overflow-hidden bg-white/50 border border-slate-100">
                  <MiniChart symbol="OANDA:EURUSD" theme="light" />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </header>

      {/* Live Market Overview */}
      <section className="py-24 relative border-t border-slate-200/60 bg-white/40 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-600">Market Overview</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white/80 backdrop-blur-xl border border-slate-200 p-4 h-[400px] relative rounded-[2rem] shadow-md"
            >
              <div className="relative h-full w-full rounded-xl overflow-hidden bg-white/50">
                 <MiniChart symbol="OANDA:EURUSD" theme="light" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-xl border border-slate-200 p-4 h-[400px] relative rounded-[2rem] shadow-md"
            >
              <div className="relative h-full w-full rounded-xl overflow-hidden bg-white/50">
                 <MiniChart symbol="OANDA:XAUUSD" theme="light" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Account Types Section */}
      <section className="py-24 relative border-t border-slate-200/60 bg-white/40 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
           >
             <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Account <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-600">Types</span></h2>
             <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">Choose the account that fits your trading style</p>
           </motion.div>
           
           <div className="relative max-w-7xl mx-auto px-2 group">
             {/* Left Arrow */}
             <button 
               onClick={() => scroll('left')}
               className="absolute left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-white shadow-md border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-all opacity-0 group-hover:opacity-100"
             >
               <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
             </button>

             {/* Right Arrow */}
             <button 
               onClick={() => scroll('right')}
               className="absolute right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-white shadow-md border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-all opacity-0 group-hover:opacity-100"
             >
               <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
             </button>

             <div
               ref={scrollRef}
               className="flex overflow-x-auto gap-6 pb-12 pt-4 px-4 snap-x snap-mandatory scroll-smooth"
               style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
             >
               {accountTypes.map((acc, index) => {
                 return (
                   <motion.div
                     key={acc.name}
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: index * 0.1 }}
                     className={`snap-center shrink-0 w-[85vw] sm:w-[320px] relative bg-white/90 border rounded-3xl p-6 sm:p-8 flex flex-col transition-all hover:-translate-y-1 ${acc.popular ? 'border-indigo-400 shadow-[0_8px_30px_rgba(99,102,241,0.2)] lg:scale-105 z-10 bg-gradient-to-b from-white to-indigo-50/50' : 'border-slate-200 shadow-lg hover:shadow-xl'}`}
                   >
                     {acc.popular && (
                       <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                         Most Popular
                       </div>
                     )}

                     <div className="text-center mb-6">
                       <h3 className={`text-2xl font-black mb-2 ${acc.popular ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-600' : 'text-slate-800'}`}>{acc.name}</h3>
                       <p className="text-sm text-slate-500 h-10 font-medium">{acc.desc}</p>
                     </div>

                     <div className="flex justify-between items-center py-4 border-y border-slate-200 mb-6">
                       <span className="text-slate-600 font-semibold">Min Deposit</span>
                       <span className="text-xl font-black text-indigo-600">{acc.deposit}</span>
                     </div>

                     <ul className="space-y-4 mb-8 flex-1">
                       {acc.features.map((feature, i) => (
                         <li key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                           <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                             <Check className="w-3 h-3 text-white" />
                           </div>
                           <span>{feature}</span>
                         </li>
                       ))}
                     </ul>

                     <Link href={isLoggedIn ? "/accounts" : "/login"} className="mt-auto">
                       <Button variant="primary" className={`w-full ${acc.popular ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-[0_4px_14px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.55)] border-0' : 'bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300'}`}>
                         {isLoggedIn ? 'Go to Accounts' : 'Trade Now'}
                       </Button>
                     </Link>
                   </motion.div>
                 );
               })}
              </div>
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative border-t border-slate-200/60 bg-white/40 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-600">{appName}</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
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
                <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_4px_24px_rgba(99,102,241,0.08)] hover:shadow-[0_8px_32px_rgba(99,102,241,0.15)] hover:border-indigo-200 h-full text-center group rounded-2xl p-6 sm:p-8 transition-all">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 border border-indigo-200/60 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 font-medium">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-24 relative border-t border-slate-200/60 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
           >
             <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Download Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-600">Trading Platform</span></h2>
           </motion.div>
           <div className="flex flex-col md:flex-row items-center justify-center gap-16 max-w-4xl mx-auto">
             <motion.div 
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="flex-1 w-full bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_4px_24px_rgba(99,102,241,0.08)] p-8 rounded-2xl"
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
                     <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                       <Check className="w-3.5 h-3.5 text-white" />
                     </div>
                     <span className="text-slate-700 font-medium">{item}</span>
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
                 <a href="#" className="flex items-center gap-4 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all rounded-xl p-3 text-slate-800">
                   <MonitorPlay className="w-8 h-8 text-indigo-500" />
                   <div className="flex flex-col items-start leading-tight">
                     <span className="text-[10px] text-slate-400 font-medium">GET IT ON</span>
                     <span className="text-lg font-semibold text-slate-800">Google Play</span>
                   </div>
                 </a>
                 <a href="#" className="flex items-center gap-4 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all rounded-xl p-3 text-slate-800">
                   <Smartphone className="w-8 h-8 text-violet-500" />
                   <div className="flex flex-col items-start leading-tight">
                     <span className="text-[10px] text-slate-400 font-medium">Download on the</span>
                     <span className="text-lg font-semibold text-slate-800">App Store</span>
                   </div>
                 </a>
               </div>
               <p className="text-xs text-slate-400 font-medium mt-6 text-center md:text-left w-full max-w-[240px]">
                 Available on Google Play and App Store
               </p>
             </motion.div>
           </div>
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="py-24 sm:py-32 relative border-t border-slate-200/60 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Banner 1: Spreads */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 p-8 sm:p-12 shadow-[0_20px_40px_rgba(15,23,42,0.2)] flex flex-col justify-between group min-h-[400px]"
            >
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-indigo-900/40 to-transparent pointer-events-none" />
              {/* Graphic elements */}
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 group-hover:scale-110 group-hover:-translate-y-4 transition-all duration-700">
                <LineChart className="w-80 h-80 text-white" />
              </div>
              
              <div className="relative z-10 max-w-sm flex-1 flex flex-col justify-center">
                <h3 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">Trade With our Best Spreads</h3>
                <p className="text-slate-300 text-lg font-medium mb-10 leading-relaxed">Trade Gold with 2.0 pips spreads and reduce costs on other popular instruments with the Ultra Low account.</p>
                <Link href={isLoggedIn ? "/accounts" : "/login"} className="inline-flex items-center gap-2 text-white font-bold hover:text-indigo-300 transition-colors text-lg w-max mt-auto">
                  Start Trading <ArrowRight className="w-6 h-6" />
                </Link>
              </div>
            </motion.div>

            {/* Banner 2: Bonus */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 to-blue-700 p-8 sm:p-12 shadow-[0_20px_40px_rgba(79,70,229,0.3)] flex flex-col justify-between group min-h-[400px]"
            >
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04]"></div>
              {/* Graphic elements */}
              <div className="absolute top-8 right-8 transform group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500 shadow-xl rounded-full">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                  <span className="text-white text-2xl font-black">%</span>
                </div>
              </div>

              <div className="relative z-10 mt-auto flex-1 flex flex-col justify-center pt-12">
                <h3 className="text-4xl sm:text-5xl font-black text-white mb-4 drop-shadow-md">100% Bonus</h3>
                <p className="text-blue-100 text-lg font-medium mb-4 leading-relaxed">Use our funds to trade more, reduce your risk, and boost your returns.</p>
                <p className="text-white font-bold text-xl mb-10 drop-shadow-sm">Get a 100% Bonus up to $100</p>
                
                <Link href={isLoggedIn ? "/accounts" : "/login"} className="mt-auto">
                  <Button variant="primary" size="lg" className="bg-white text-indigo-700 border-0 hover:bg-indigo-50 hover:text-indigo-800 font-black px-8 shadow-[0_8px_20px_rgba(255,255,255,0.3)] hover:shadow-[0_12px_25px_rgba(255,255,255,0.5)] transition-all w-max rounded-xl">
                    Claim Bonus
                  </Button>
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-600">{appName}</span>
            </div>
            
            <div className="flex gap-8 text-sm font-semibold text-slate-500">
              <Link href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
            </div>

            <p className="text-sm text-slate-400 font-medium">
              &copy; {new Date().getFullYear()} {appName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

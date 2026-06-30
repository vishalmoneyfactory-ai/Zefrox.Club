import Link from 'next/link';
import TickerTape from '@/components/features/TickerTape';
import MiniChart from '@/components/features/MiniChart';

const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Zerofx.club';

const features = [
  {
    icon: (
      <svg className="w-8 h-8 text-[#00E5B0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    title: 'Ultra-Low Spreads',
    description: 'on XAU EUR',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#00E5B0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    title: '200+ Instruments',
    description: 'Forex, Crypto & More',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#00E5B0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6l-3-3h1.5a3 3 0 100-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: '$40 Minimum',
    description: 'Start with just $40',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#00E5B0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: '24/7 Support',
    description: 'Round-the-clock assistance',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#13161c] text-white selection:bg-[#00E5B0] selection:text-[#13161c]">
      {/* Ticker Tape */}
      <div className="w-full bg-white h-[44px]">
        <TickerTape />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#13161c]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex flex-1 items-center justify-start">
              <span className="text-2xl font-bold tracking-tight text-[#00E5B0]">{appName}</span>
            </div>
            
            <div className="hidden md:flex flex-1 items-center justify-center space-x-8">
              <a href="#" className="text-white font-medium hover:text-[#00E5B0] transition-colors border-b-2 border-[#00E5B0] pb-1">Home</a>
              <a href="#about" className="text-slate-300 font-medium hover:text-[#00E5B0] transition-colors pb-1">About Us</a>
              <a href="#contact" className="text-slate-300 font-medium hover:text-[#00E5B0] transition-colors pb-1">Contact</a>
              <Link href="/admin/login" className="text-slate-300 font-medium hover:text-[#00E5B0] transition-colors pb-1">Admin</Link>
            </div>

            <div className="flex flex-1 items-center justify-end gap-6">
              <button className="text-slate-400 hover:text-white transition-colors hidden sm:block">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-[#00E5B0] hover:bg-[#00c99a] text-[#13161c] text-sm font-bold rounded-lg transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-0 w-64 h-64 bg-[#00E5B0]/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#8b5cf6]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#00E5B0] text-sm font-medium mb-8">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                Trusted by 12,400+ Traders
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-4">
                Trade Smarter<br />
                <span className="bg-gradient-to-r from-[#00E5B0] to-[#8b5cf6] text-transparent bg-clip-text">Trade Faster</span>
              </h1>

              <p className="text-xl text-slate-400 mb-10">
                Claim your 100% deposit bonus
              </p>

              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#00E5B0] hover:bg-[#00c99a] text-[#13161c] text-lg font-bold rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(0,229,176,0.3)] hover:shadow-[0_0_30px_rgba(0,229,176,0.5)]"
              >
                Trade Now
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>

            {/* Right Content (Mini Chart) */}
            <div className="flex-1 w-full max-w-lg lg:max-w-xl z-10">
              <div className="bg-[#1a1d24] rounded-2xl shadow-2xl border border-white/5 p-4 h-[350px]">
                <MiniChart />
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 bg-[#1a1d24]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose <span className="text-[#8b5cf6]">Zerofx.club</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[#222630] rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-colors text-center"
              >
                <div className="flex justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 font-medium">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#8b5cf6]/10 rounded-full blur-3xl translate-y-1/3 translate-x-1/3" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-sm font-bold tracking-widest text-[#00E5B0] uppercase mb-3">About Us</h2>
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
                Empowering Traders with Next-Generation Execution
              </h3>
              <div className="space-y-6 text-slate-400 text-lg">
                <p>
                  At Zerofx.club, we believe that every trader deserves institutional-grade access to the global financial markets. Built by traders for traders, our platform is engineered to deliver lightning-fast execution, ultra-tight spreads, and an environment completely free from artificial limitations.
                </p>
                <p>
                  Whether you are navigating the high-liquidity Forex markets, exploring the volatile world of Cryptocurrencies, or diversifying with global Indices and Commodities, we provide the robust infrastructure necessary for you to trade with absolute confidence.
                </p>
                <p>
                  With a commitment to transparency, security, and round-the-clock dedicated support, our mission is to remain your trusted partner in navigating the complexities of modern trading. Join over 12,000 active members who have already made the switch to smarter, faster trading.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square md:aspect-auto md:h-[500px] rounded-3xl bg-gradient-to-br from-[#222630] to-[#1a1d24] border border-white/5 p-8 flex flex-col justify-between">
                <div className="space-y-8">
                  <div>
                    <h4 className="text-4xl font-bold text-white">12.4k+</h4>
                    <p className="text-[#00E5B0] font-medium mt-1">Active Traders globally</p>
                  </div>
                  <div>
                    <h4 className="text-4xl font-bold text-white">200+</h4>
                    <p className="text-[#8b5cf6] font-medium mt-1">Tradable Instruments</p>
                  </div>
                  <div>
                    <h4 className="text-4xl font-bold text-white">&lt;10ms</h4>
                    <p className="text-blue-400 font-medium mt-1">Average Execution Speed</p>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-white/10">
                  <p className="text-slate-400 italic">
                    "The latency and spread on XAU/USD are unmatched. Zerofx has completely transformed my day-trading strategy."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#13161c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#00E5B0]">{appName}</span>
            </div>
            
            <div className="flex gap-6 text-sm font-medium text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>

            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} {appName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}



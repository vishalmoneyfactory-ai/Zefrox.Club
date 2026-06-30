import Link from 'next/link';

const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Zerofx.club';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 selection:bg-blue-200 selection:text-blue-900">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex flex-1 items-center justify-start gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">{appName}</span>
            </div>
            
            <div className="hidden md:flex flex-1 items-center justify-center space-x-8">
              <Link href="/" className="text-slate-600 font-medium hover:text-blue-600 transition-colors pb-1">Home</Link>
              <Link href="/about" className="text-blue-600 font-semibold transition-colors border-b-2 border-blue-600 pb-1">About Us</Link>
              <Link href="/#contact" className="text-slate-600 font-medium hover:text-blue-600 transition-colors pb-1">Contact</Link>
              <Link href="/admin/login" className="text-slate-600 font-medium hover:text-blue-600 transition-colors pb-1">Admin</Link>
            </div>

            <div className="flex flex-1 items-center justify-end">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* About Us Content */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-3xl translate-y-1/3 translate-x-1/3" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-sm font-bold tracking-widest text-blue-600 uppercase mb-3">About Us</h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
                Empowering Traders with Next-Generation Execution
              </h3>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                <p>
                  At {appName}, we believe that every trader deserves institutional-grade access to the global financial markets. Built by traders for traders, our platform is engineered to deliver lightning-fast execution, ultra-tight spreads, and an environment completely free from artificial limitations.
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
              <div className="aspect-square md:aspect-auto md:h-[500px] rounded-3xl bg-white border border-slate-100 shadow-xl p-8 flex flex-col justify-between">
                <div className="space-y-8">
                  <div>
                    <h4 className="text-4xl font-bold text-slate-900">12.4k+</h4>
                    <p className="text-blue-600 font-semibold mt-1">Active Traders globally</p>
                  </div>
                  <div>
                    <h4 className="text-4xl font-bold text-slate-900">200+</h4>
                    <p className="text-indigo-600 font-semibold mt-1">Tradable Instruments</p>
                  </div>
                  <div>
                    <h4 className="text-4xl font-bold text-slate-900">&lt;10ms</h4>
                    <p className="text-blue-500 font-semibold mt-1">Average Execution Speed</p>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <p className="text-slate-500 italic font-medium">
                    "The latency and spread on XAU/USD are unmatched. Zerofx has completely transformed my day-trading strategy."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-slate-900">{appName}</span>
            </div>
            
            <div className="flex gap-6 text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
              <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
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

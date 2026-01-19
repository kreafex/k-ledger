import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, PieChart, ArrowRightLeft, TrendingUp, Wallet } from 'lucide-react';

// New "Professional & Bright" Image placeholders
const HERO_IMAGE_URL = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"; // Clean dashboard/analytics
const FEATURE_IMAGE_URL = "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"; // Money/Growth concept

export const LandingPage = () => {
  const navigate = useNavigate();

  // --- BRAND COLORS (Tailwind equivalents) ---
  // Navy: text-slate-900 / bg-slate-900 (or blue-950)
  // Orange: text-orange-600 / bg-orange-600
  // White: bg-white
  // Black: text-black

  // Navigation Bar
  const Navbar = () => (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="flex justify-between items-center py-4 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
           <div className="bg-orange-600 p-2 rounded-lg">
              <Wallet className="text-white w-6 h-6" />
           </div>
           <span className="text-2xl font-extrabold text-slate-900 tracking-tight">K-Ledger</span>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/auth')} 
            className="text-slate-600 hover:text-orange-600 font-semibold px-4 py-2 transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/auth')} 
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );

  // Hero Section
  const HeroSection = () => (
    <div className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Text Content */}
        <div className="space-y-8 relative z-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 font-bold text-sm uppercase tracking-wide">
            <TrendingUp size={16} /> Wealth Management Refined
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1]">
            Your Wealth. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
              Clarified.
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-lg leading-relaxed font-medium">
            K-Ledger isn't just a tracker. It's a professional double-entry system designed to give you absolute control over your personal and business finances.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
                onClick={() => navigate('/auth')} 
                className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-orange-500/30 transition-all hover:scale-105"
            >
              Start Free Trial <ArrowRight size={20}/>
            </button>
            <button 
                onClick={() => navigate('/auth')} 
                className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-400 hover:text-slate-900 px-8 py-4 rounded-xl font-bold text-lg transition-all"
            >
              View Demo
            </button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative z-10 lg:ml-auto w-full group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-slate-900 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                <img src={HERO_IMAGE_URL} alt="K-Ledger Dashboard" className="w-full h-auto object-cover transform transition-transform duration-700 hover:scale-105" />
            </div>
            
            {/* Floating Badge */}
            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-xl shadow-xl border border-slate-100 hidden md:block animate-bounce-slow">
                <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full text-green-600">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">Net Worth</p>
                        <p className="text-slate-900 text-xl font-extrabold">+24.5%</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -z-0 w-1/3 h-full bg-slate-100 skew-x-12 origin-top"></div>
    </div>
  );

  // Features Section
  const FeaturesSection = () => (
    <div className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-20">
            <h2 className="text-orange-600 font-bold tracking-widest uppercase text-sm mb-3">Why K-Ledger?</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Beyond Basic Budgeting</h3>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Most apps just track spending. We track <span className="text-slate-900 font-bold">Value</span>. Experience the precision of true accounting.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300">
            <div className="bg-white w-14 h-14 flex items-center justify-center rounded-xl mb-6 shadow-sm text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <ShieldCheck size={28} />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-3">True Net Worth</h4>
            <p className="text-slate-600 leading-relaxed">Separate your starting capital from new income. Watch your actual wealth grow with precision analytics.</p>
          </div>

          {/* Feature 2 */}
          <div className="group p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 hover:shadow-xl transition-all duration-300">
            <div className="bg-white w-14 h-14 flex items-center justify-center rounded-xl mb-6 shadow-sm text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <ArrowRightLeft size={28} />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-3">Smart Transfers</h4>
            <p className="text-slate-600 leading-relaxed">Moving money isn't spending. Track M-Pesa to Bank transfers seamlessly without distorting your reports.</p>
          </div>

          {/* Feature 3 */}
          <div className="group p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300">
            <div className="bg-white w-14 h-14 flex items-center justify-center rounded-xl mb-6 shadow-sm text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <PieChart size={28} />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-3">Double-Entry Power</h4>
            <p className="text-slate-600 leading-relaxed">Every transaction has a source and destination. Get the clarity businesses use to manage millions.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Large Call to Action
  const CTASection = () => (
      <div className="relative py-24 bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
              <img src={FEATURE_IMAGE_URL} alt="Background" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
               <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8">Ready to master your money?</h2>
               <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">Join the new standard of personal finance. Secure, precise, and built for growth.</p>
               <button onClick={() => navigate('/auth')} className="bg-orange-600 hover:bg-orange-500 text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl transition-all transform hover:-translate-y-1">
                  Create Free Account
               </button>
          </div>
      </div>
  )

  // Footer
  const Footer = () => (
    <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                 <div className="bg-slate-900 p-1.5 rounded-lg">
                    <Wallet className="text-white w-5 h-5" />
                 </div>
                <span className="text-xl font-bold text-slate-900">K-Ledger</span>
            </div>
            
            <div className="flex gap-8 text-sm font-medium text-slate-500">
                <a href="#" className="hover:text-orange-600 transition-colors">Privacy</a>
                <a href="#" className="hover:text-orange-600 transition-colors">Terms</a>
                <a href="#" className="hover:text-orange-600 transition-colors">Support</a>
            </div>

            <p className="text-slate-400 text-sm">
                © {new Date().getFullYear()} Kreafex Systems.
            </p>
        </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-900">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  );
};
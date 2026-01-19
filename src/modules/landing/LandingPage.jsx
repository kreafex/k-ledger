import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, PieChart, ArrowRightLeft } from 'lucide-react';

// Placeholder images - REPLACE THESE with screenshots of your actual app later!
const HERO_IMAGE_URL = "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const FEATURE_IMAGE_URL = "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export const LandingPage = () => {
  const navigate = useNavigate();

  // Simple Navigation Bar
  const Navbar = () => (
    <nav className="flex justify-between items-center py-6 px-8 max-w-7xl mx-auto">
      <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
        Kreafex Finance.
      </div>
      <div className="flex gap-4">
        <button onClick={() => navigate('/auth')} className="text-slate-300 hover:text-white font-medium px-4 py-2 transition-colors">Login</button>
        <button onClick={() => navigate('/auth')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-blue-500/25 transition-all">
          Get Started
        </button>
      </div>
    </nav>
  );

  // Hero Section (The top part)
  const HeroSection = () => (
    <div className="relative overflow-hidden pt-16 pb-32">
      <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="space-y-8 relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
            Master Your Money. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500">
              With Precision.
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
            Stop just tracking spending. Start managing wealth. The professional-grade double-entry finance system built for personal clarity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => navigate('/auth')} className="flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-200 px-8 py-4 rounded-full font-bold text-lg transition-all">
              Start Your Journey <ArrowRight size={20}/>
            </button>
          </div>
        </div>

        {/* Hero Image / Mockup container */}
        <div className="relative z-10 lg:ml-auto">
            {/* Glowing blob effect behind the image */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 opacity-30 blur-3xl rounded-3xl"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800/50 glassmorphism-container rotate-2 hover:rotate-0 transition-all duration-500">
                <img src={HERO_IMAGE_URL} alt="App Dashboard Mockup" className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity" />
                {/* Overlay to make it look like a screen */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
            </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl mix-blend-screen animate-blob"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl mix-blend-screen animate-blob animation-delay-2000"></div>
      </div>
    </div>
  );

  // Features Section
  const FeaturesSection = () => (
    <div className="py-24 bg-slate-900/50 relative">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Beyond Basic Budgeting</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Most apps just show you what you spent. We show you where you stand using true accounting principles.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-2xl hover:bg-slate-800/60 transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
            <div className="bg-emerald-500/20 w-12 h-12 flex items-center justify-center rounded-lg mb-6 text-emerald-400">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">True Net Worth</h3>
            <p className="text-slate-400">Separate your starting capital from new income. See your actual wealth grow, not just cash flow.</p>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-2xl hover:bg-slate-800/60 transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
            <div className="bg-blue-500/20 w-12 h-12 flex items-center justify-center rounded-lg mb-6 text-blue-400">
              <ArrowRightLeft size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Seamless Transfers</h3>
            <p className="text-slate-400">Moving money between accounts isn't spending. Track M-Pesa to Bank transfers without breaking your stats.</p>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-2xl hover:bg-slate-800/60 transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
            <div className="bg-purple-500/20 w-12 h-12 flex items-center justify-center rounded-lg mb-6 text-purple-400">
              <PieChart size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Double-Entry Power</h3>
            <p className="text-slate-400">Every transaction has a source and a destination. Get the same clarity businesses use to manage millions.</p>
          </div>
        </div>
      </div>
    </div>
  );


  // Image Divider Section
  const ImageDividerBtn = () => (
      <div className="relative h-64 md:h-96 w-full overflow-hidden">
          <img src={FEATURE_IMAGE_URL} alt="Finance abstract" className="w-full h-full object-cover opacity-40 grayscale hover:grayscale-0 transition-all duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent flex items-center justify-center">
               <button onClick={() => navigate('/auth')} className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-slate-900 transition-all">
                  Take Control Today
               </button>
          </div>
      </div>
  )

  // Footer
  const Footer = () => (
    <footer className="py-12 border-t border-slate-800 bg-slate-950 text-center relative z-10">
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center justify-center gap-4">
            <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-600 opacity-50">
                Kreafex Finance.
            </div>
            <p className="text-slate-500 text-sm font-medium tracking-wider uppercase">
                A product of Kreafex
            </p>
            <p className="text-slate-600 text-xs mt-4">
                © {new Date().getFullYear()}. All rights reserved.
            </p>
        </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-slate-950 overflow-x-hidden relative">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ImageDividerBtn />
      <Footer />
    </div>
  );
};
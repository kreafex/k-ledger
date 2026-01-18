import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

export const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-brand-light overflow-hidden">
      
      {/* 1. DESKTOP SIDEBAR (Hidden on mobile) */}
      <Sidebar isMobile={false} />

      {/* 2. MOBILE SIDEBAR (Overlay) - HIGHEST LAYER (z-50) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
            onClick={() => setSidebarOpen(false)}
          ></div>
          {/* The Sidebar Itself */}
          <Sidebar isMobile={true} onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* 3. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden w-full relative">
        
        {/* --- MOBILE HEADER (UPDATED) --- */}
        {/* 'fixed top-0' pins it to the top of the screen */}
        {/* 'z-40' keeps it above the page content */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-sm flex items-center justify-between px-4 z-40">
          <span className="text-xl font-bold text-brand-navy">K-Ledger</span>
          
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-2 text-brand-navy hover:bg-gray-100 rounded-md"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* --- PAGE CONTENT --- */}
        {/* 'pt-20' adds padding at the top so content doesn't hide behind the fixed header */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 pt-20 md:pt-8 z-0">
           {children}
        </main>
      </div>
    </div>
  );
};
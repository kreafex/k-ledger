import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

export const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-brand-light overflow-hidden">
      
      {/* 1. DESKTOP SIDEBAR (Hidden on mobile) */}
      <Sidebar isMobile={false} />

      {/* 2. MOBILE SIDEBAR (Overlay) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
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
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        
        {/* Mobile Header (Hamburger) */}
        {/* UPDATED: Added 'relative z-40' to the container so the bar stays on top */}
        <div className="md:hidden bg-white shadow-sm h-16 flex items-center justify-between px-4 shrink-0 relative z-40">
          <span className="text-xl font-bold text-brand-navy">K-Ledger</span>
          
          {/* UPDATED: Added 'relative z-50' to the button to force it to be clickable */}
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-2 text-brand-navy hover:bg-gray-100 rounded-md relative z-50"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative z-0">
           {children}
        </main>
      </div>
    </div>
  );
};
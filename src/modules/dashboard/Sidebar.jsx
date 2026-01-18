import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabase';
import { LayoutDashboard, Target, Settings, LogOut, List, Calendar, X } from 'lucide-react';

export const Sidebar = ({ isMobile, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleNav = (path) => {
    navigate(path);
    if (isMobile && onClose) onClose(); // <--- AUTO CLOSE ON CLICK
  };

  const getButtonClass = (path) => {
    const isActive = location.pathname === path;
    const base = "flex items-center w-full px-4 py-3 rounded-md transition-colors font-medium ";
    return isActive 
      ? base + "text-white bg-brand-orange shadow-sm" 
      : base + "text-slate-300 hover:bg-slate-800 hover:text-white";
  };

  // Base classes for the sidebar container
  const containerClasses = isMobile 
    ? "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out" 
    : "hidden md:flex flex-col w-64 bg-slate-900 text-white shadow-xl h-full";

  return (
    <div className={containerClasses}>
      {/* 1. HEADER */}
      <div className="flex items-center justify-between h-20 border-b border-slate-700 px-6">
         <span className="text-2xl font-bold tracking-wider">K-LEDGER</span>
         {isMobile && (
           <button onClick={onClose} className="text-slate-400 hover:text-white">
             <X size={24} />
           </button>
         )}
      </div>
      
      {/* 2. MENU */}
      <div className="flex-1 py-6 space-y-2 px-4 overflow-y-auto">
        <button onClick={() => handleNav('/dashboard')} className={getButtonClass('/dashboard')}>
          <LayoutDashboard className="mr-3" size={20} /> Dashboard
        </button>
        <button onClick={() => handleNav('/transactions')} className={getButtonClass('/transactions')}>
          <List className="mr-3" size={20} /> Transactions
        </button>
        <button onClick={() => handleNav('/budgets')} className={getButtonClass('/budgets')}>
          <Target className="mr-3" size={20} /> Budgets
        </button>
        <button onClick={() => handleNav('/planner')} className={getButtonClass('/planner')}>
          <Calendar className="mr-3" size={20} /> Planner
        </button>
        <button onClick={() => handleNav('/settings')} className={getButtonClass('/settings')}>
          <Settings className="mr-3" size={20} /> Settings
        </button>
      </div>

      {/* 3. FOOTER */}
      <div className="p-4 border-t border-slate-700">
        <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-md transition-colors">
          <LogOut className="mr-3" size={18} /> Sign Out
        </button>
      </div>
    </div>
  );
};
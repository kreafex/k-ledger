import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';

// --- IMPORT PATHS ---

// 1. Landing Page
import { LandingPage } from './modules/landing/LandingPage';

// 2. Dashboard 
import { DashboardPage } from './modules/dashboard/Dashboard';

// 3. Transactions 
import { TransactionsPage } from './modules/transactions/TransactionsPage';

// 4. Auth 
import { AuthPage } from './modules/auth/AuthPage';

// 5. NEW PAGES (Budgets, Planner, Settings)
import { BudgetsPage } from './modules/budgets/BudgetsPage';
import { PlannerPage } from './modules/planner/PlannerPage';
import { SettingsPage } from './modules/settings/SettingsPage';


const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Listen for changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show a blank screen or spinner while checking if user is logged in
  if (loading) return <div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

  return (
    <Router>
      <Routes>
        
        {/* === RULE 1: The "/" path refers to the Landing Page === */}
        <Route path="/" element={<LandingPage />} />

        {/* === RULE 2: The "/auth" path refers to Login === */}
        <Route path="/auth" element={!session ? <AuthPage /> : <Navigate to="/dashboard" />} />


        {/* === RULE 3: PROTECTED ROUTES (Must be logged in) === */}
        
        {/* Dashboard */}
        <Route 
          path="/dashboard" 
          element={session ? <DashboardPage /> : <Navigate to="/auth" />} 
        />
        
        {/* Transactions */}
        <Route 
          path="/transactions" 
          element={session ? <TransactionsPage /> : <Navigate to="/auth" />} 
        />

        {/* Budgets */}
        <Route 
          path="/budgets" 
          element={session ? <BudgetsPage /> : <Navigate to="/auth" />} 
        />

        {/* Planner */}
        <Route 
          path="/planner" 
          element={session ? <PlannerPage /> : <Navigate to="/auth" />} 
        />

        {/* Settings */}
        <Route 
          path="/settings" 
          element={session ? <SettingsPage /> : <Navigate to="/auth" />} 
        />

        {/* === RULE 4: Catch-all (Redirect random URLs to Home) === */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
};

export default App;
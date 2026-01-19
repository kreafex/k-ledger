import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';

// --- IMPORT PATHS FIXED ---

// 1. Landing Page (File: src/modules/landing/LandingPage.jsx)
import { LandingPage } from './modules/landing/LandingPage';

// 2. Dashboard (File: src/modules/dashboard/Dashboard.jsx) <--- FIXED PATH
import { DashboardPage } from './modules/dashboard/Dashboard';

// 3. Transactions (File: src/modules/transactions/TransactionsPage.jsx)
import { TransactionsPage } from './modules/transactions/TransactionsPage';

// 4. Auth (File: src/modules/auth/AuthPage.jsx)
import { AuthPage } from './modules/auth/AuthPage';

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
        {/* If user is ALREADY logged in, bounce them to Dashboard */}
        <Route path="/auth" element={!session ? <AuthPage /> : <Navigate to="/dashboard" />} />


        {/* === RULE 3: Protected Routes (Must be logged in) === */}
        
        <Route 
          path="/dashboard" 
          element={session ? <DashboardPage /> : <Navigate to="/auth" />} 
        />
        
        <Route 
          path="/transactions" 
          element={session ? <TransactionsPage /> : <Navigate to="/auth" />} 
        />

        {/* === RULE 4: Catch-all (Redirect random URLs to Home) === */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
};

export default App;
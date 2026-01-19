import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';

// Import your pages
import { LandingPage } from './modules/landing/LandingPage';
import { DashboardPage } from './modules/dashboard/DashboardPage';
import { TransactionsPage } from './modules/transactions/TransactionsPage';
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
  if (loading) return <div className="h-screen w-screen bg-slate-950"></div>;

  return (
    <Router>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        
        {/* 1. Root Path ('/') -> ALWAYS shows Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* 2. Auth Path ('/auth') -> Shows Login (or redirects to dashboard if already logged in) */}
        <Route path="/auth" element={!session ? <AuthPage /> : <Navigate to="/dashboard" />} />


        {/* --- PROTECTED ROUTES (Require Login) --- */}
        
        {/* 3. Dashboard -> Protected */}
        <Route 
          path="/dashboard" 
          element={session ? <DashboardPage /> : <Navigate to="/auth" />} 
        />
        
        {/* 4. Transactions -> Protected */}
        <Route 
          path="/transactions" 
          element={session ? <TransactionsPage /> : <Navigate to="/auth" />} 
        />

        {/* 5. Catch-all: If user types random junk, go to Home */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
};

export default App;
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';

// Import your pages
import { LandingPage } from './modules/landing/LandingPage'; // <--- NEW IMPORT
import { DashboardPage } from './modules/dashboard/DashboardPage';
import { TransactionsPage } from './modules/transactions/TransactionsPage';
import { AuthPage } from './modules/auth/AuthPage'; // Assuming you have an Auth page

const App = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Listen for changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        {/* ROUTE LOGIC:
           1. Root path ('/') shows Landing Page.
           2. Dashboard is protected. If no user, go to Auth.
        */}
        
        {/* The Landing Page (Public) */}
        <Route path="/" element={<LandingPage />} />

        {/* The Auth Page (Login/Signup) */}
        <Route path="/auth" element={!session ? <AuthPage /> : <Navigate to="/dashboard" />} />

        {/* Protected Dashboard Routes */}
        <Route 
          path="/dashboard" 
          element={session ? <DashboardPage /> : <Navigate to="/auth" />} 
        />
        
        <Route 
          path="/transactions" 
          element={session ? <TransactionsPage /> : <Navigate to="/auth" />} 
        />

      </Routes>
    </Router>
  );
};

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthPage } from './modules/auth/AuthPage';

// --- THE FIX IS HERE ---
// We import the component { DashboardPage } from the file './modules/dashboard/Dashboard'
import { DashboardPage } from './modules/dashboard/Dashboard'; 

import { BudgetsPage } from './modules/budgets/BudgetsPage';
import { SettingsPage } from './modules/settings/SettingsPage';
import { TransactionsPage } from './modules/transactions/TransactionsPage'; 
import { PlannerPage } from './modules/planner/PlannerPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        
        {/* The route uses the component we imported */}
        <Route path="/dashboard" element={<DashboardPage />} /> 
        
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/planner" element={<PlannerPage />} />
      </Routes>
    </Router>
  );
}

export default App;
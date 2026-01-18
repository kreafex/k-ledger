import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react'; // Removed 'Menu' and 'Sidebar' imports
import { BudgetModal } from '../dashboard/BudgetModal';
import { AppLayout } from '../dashboard/AppLayout'; // <--- USE THIS

export const BudgetsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [budgets, setBudgets] = useState([]);

  // --- LOGIC: Fetch & Calculate Budgets (OPTIMIZED) ---
  const loadBudgetData = async (userId) => {
    // 1. Get Budgets
    const { data: userBudgets } = await supabase.from('budgets').select('*').eq('owner_id', userId);
    
    // 2. OPTIMIZATION: Get Transactions for THIS Month ONLY
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, category, type')
      .eq('type', 'expense')
      .gte('date', startOfMonth); 

    if (userBudgets && transactions) {
      const calculated = userBudgets.map(b => {
        const spent = transactions
          .filter(t => t.category === b.category)
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const percent = Math.min((spent / b.amount) * 100, 100);
        return { ...b, spent, percent, isOver: spent > b.amount };
      });
      setBudgets(calculated);
    }
  };

  const handleDelete = async (id) => {
    if(confirm("Delete this budget?")) {
      await supabase.from('budgets').delete().eq('id', id);
      loadBudgetData(user.id);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }
      setUser(user);
      await loadBudgetData(user.id);
      setLoading(false);
    };
    init();
  }, [navigate]);

  if (loading) return <div className="h-screen flex items-center justify-center text-brand-navy">Loading...</div>;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">Monthly Budgets</h1>
            <p className="text-gray-500">Track your spending limits for this month.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center px-4 py-2 bg-brand-navy text-white rounded-md hover:bg-slate-800 shadow">
            <Plus size={18} className="mr-2" /> New Budget
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {budgets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              You haven't set any budgets yet. Click "New Budget" to start.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {budgets.map(b => (
                <div key={b.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{b.category}</h3>
                      <p className="text-xs text-gray-500">{b.period} Limit</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${b.isOver ? 'text-red-600' : 'text-gray-700'}`}>
                        {b.spent.toLocaleString()}
                      </span>
                      <span className="text-gray-400 text-sm"> / {Number(b.amount).toLocaleString()} KES</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className={`h-4 rounded-full transition-all duration-500 ${b.isOver ? 'bg-red-600' : 'bg-green-500'}`} style={{ width: `${b.percent}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <p className={`text-xs font-bold ${b.isOver ? 'text-red-600' : 'text-green-600'}`}>
                      {b.isOver ? 'OVER BUDGET!' : `${(100 - b.percent).toFixed(0)}% Remaining`}
                    </p>
                    <button onClick={() => handleDelete(b.id)} className="text-gray-400 hover:text-red-500 text-xs flex items-center">
                      <Trash2 size={12} className="mr-1"/> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BudgetModal isOpen={showModal} onClose={() => setShowModal(false)} userId={user?.id} onSuccess={() => loadBudgetData(user.id)} />
    </AppLayout>
  );
};
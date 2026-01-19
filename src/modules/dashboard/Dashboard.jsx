import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, PieChart as PieIcon, Lightbulb, Wallet, 
  TrendingUp, TrendingDown, Briefcase, List, PiggyBank,
  Eye, EyeOff, Calendar 
} from 'lucide-react';
import { AddTransactionModal } from './AddTransactionModal';
import { AppLayout } from './AppLayout'; 
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // --- PRIVACY STATE ---
  const [showPrivacy, setShowPrivacy] = useState(false); 

  // --- FILTER STATE ---
  const [dateFilter, setDateFilter] = useState('THIS_MONTH'); // Default to This Month
  const [rawTransactions, setRawTransactions] = useState([]); // Store ALL data here

  const [totals, setTotals] = useState({ income: 0, expense: 0, investment: 0, savings: 0, balance: 0 });
  const [insights, setInsights] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [activeChart, setActiveChart] = useState('OVERALL');
  const [chartBuckets, setChartBuckets] = useState({ overall: [], expense: [], income: [], investment: [], savings: [] });

  const OVERALL_COLOR_MAP = { 'Income': '#10B981', 'Expense': '#EF4444', 'Investment': '#8B5CF6', 'Savings': '#06B6D4' };
  const DETAIL_COLORS = {
    expense: ['#EF4444', '#F97316', '#F59E0B', '#B91C1C', '#991B1B'], 
    income: ['#10B981', '#34D399', '#065F46', '#047857'],
    investment: ['#8B5CF6', '#A78BFA', '#5B21B6', '#4C1D95'],
    savings: ['#06B6D4', '#22D3EE', '#0891B2', '#155E75']
  };

  // 1. FETCH DATA (Runs once on mount)
  useEffect(() => {
    const fetchAllData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }
      setUser(user);

      const { data } = await supabase
        .from('transactions')
        .select('amount, type, category, date, is_initial') 
        .order('date', { ascending: false });

      setRawTransactions(data || []);
      setLoading(false);
    };
    fetchAllData();
  }, [navigate]);

  // 2. PROCESS DATA (Runs whenever Filter or Data changes)
  useEffect(() => {
    if (loading) return;

    // --- A. CALCULATE NET WORTH (Always All Time) ---
    let globalIncome = 0, globalExpense = 0, globalInitial = 0;
    
    rawTransactions.forEach(t => {
        const amt = Number(t.amount);
        
        // --- FIXED LOGIC HERE ---
        // 1. If it is an Opening Balance (regardless of type), add to Initial ONLY.
        if (t.is_initial || t.type === 'initial') {
            globalInitial += amt;
        } 
        // 2. If it is NOT initial, then sort into Income/Expense
        else {
            if (t.type === 'income') globalIncome += amt;
            else if (t.type === 'expense') globalExpense += amt;
            // Note: We ignore Savings/Investments here for Net Worth calculation 
            // because they are just asset transfers (Money you still have).
        }
    });
    
    // Net Worth = (Money You Started With + Money You Earned) - Money You Spent
    const netWorth = (globalInitial + globalIncome) - globalExpense;

    // --- B. FILTER DATA FOR DASHBOARD VIEW ---
    const filteredData = rawTransactions.filter(t => {
        if (dateFilter === 'ALL') return true;
        
        const tDate = new Date(t.date);
        const now = new Date();
        tDate.setHours(0,0,0,0); now.setHours(0,0,0,0);

        if (dateFilter === 'TODAY') return tDate.getTime() === now.getTime();
        if (dateFilter === 'THIS_WEEK') {
            const start = new Date(now); start.setDate(now.getDate() - now.getDay());
            return tDate >= start;
        }
        if (dateFilter === 'THIS_MONTH') return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
        if (dateFilter === 'THIS_YEAR') return tDate.getFullYear() === now.getFullYear();
        return true;
    });

    // --- C. CALCULATE VIEW TOTALS ---
    let viewIncome = 0, viewExpense = 0, viewInvest = 0, viewSavings = 0;
    const catGroups = { expense: {}, income: {}, investment: {}, savings: {} };

    filteredData.forEach(t => {
      const amt = Number(t.amount);
      
      // Skip "Initial Balances" for the Periodic View (e.g. Income Card shouldn't show Opening Balance)
      if (t.is_initial || t.type === 'initial') return;

      if (t.type === 'income') { 
        viewIncome += amt; 
        catGroups.income[t.category] = (catGroups.income[t.category] || 0) + amt; 
      }
      else if (t.type === 'expense') { 
        viewExpense += amt; 
        catGroups.expense[t.category] = (catGroups.expense[t.category] || 0) + amt; 
      }
      else if (t.type === 'investment') { 
        viewInvest += amt; 
        catGroups.investment[t.category] = (catGroups.investment[t.category] || 0) + amt; 
      }
      else if (t.type === 'savings') { 
        viewSavings += amt; 
        catGroups.savings[t.category] = (catGroups.savings[t.category] || 0) + amt; 
      }
    });

    setTotals({ 
      income: viewIncome, 
      expense: viewExpense, 
      investment: viewInvest, 
      savings: viewSavings, 
      balance: netWorth // This remains Global!
    });

    // --- D. PREPARE CHARTS ---
    const toChartData = (map) => Object.keys(map).map(k => ({ name: k, value: map[k] }));
    const buckets = {
      overall: [
        { name: 'Income', value: viewIncome }, 
        { name: 'Expense', value: viewExpense }, 
        { name: 'Investment', value: viewInvest },
        { name: 'Savings', value: viewSavings }
      ].filter(i => i.value > 0),
      expense: toChartData(catGroups.expense),
      income: toChartData(catGroups.income),
      investment: toChartData(catGroups.investment),
      savings: toChartData(catGroups.savings)
    };
    setChartBuckets(buckets);
    setChartData(buckets[activeChart.toLowerCase()] || buckets.overall);

    // --- E. INSIGHTS ---
    const alerts = [];
    if (viewExpense > viewIncome && viewIncome > 0) alerts.push("Warning: You are spending more than you earn this period.");
    if (viewSavings === 0 && viewIncome > 0) alerts.push("You haven't recorded any savings this period.");
    
    setInsights(alerts.length > 0 ? alerts : ["Your financial health is stable."]);

  }, [rawTransactions, dateFilter, activeChart, loading]); 
  // Rerun whenever Filter changes OR Data loads

  const handleChartToggle = (type) => { setActiveChart(type); };
  const getSliceColor = (entry, index) => activeChart === 'OVERALL' ? OVERALL_COLOR_MAP[entry.name] : (DETAIL_COLORS[activeChart.toLowerCase()] || ['#ccc'])[index % 5];

  if (loading) return <div className="h-screen flex items-center justify-center text-brand-navy">Loading...</div>;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">Dashboard</h1>
            <p className="text-gray-500">Your financial overview.</p>
          </div>
          
          <div className="flex gap-3">
             {/* DATE FILTER DROPDOWN */}
             <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-gray-500" size={16} />
                <select 
                    value={dateFilter} 
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="pl-10 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-brand-navy font-medium shadow-sm outline-none focus:ring-2 focus:ring-brand-navy cursor-pointer"
                >
                    <option value="THIS_MONTH">This Month</option>
                    <option value="TODAY">Today</option>
                    <option value="THIS_WEEK">This Week</option>
                    <option value="THIS_YEAR">This Year</option>
                    <option value="ALL">All Time</option>
                </select>
             </div>

             {/* PRIVACY TOGGLE */}
             <button 
                onClick={() => setShowPrivacy(!showPrivacy)} 
                className="flex items-center gap-2 text-sm text-brand-navy hover:text-brand-orange bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm transition-all"
            >
                {showPrivacy ? <EyeOff size={16}/> : <Eye size={16}/>}
                <span className="hidden sm:inline">{showPrivacy ? 'Hide' : 'Show'}</span>
            </button>
          </div>
        </div>

        {/* MONEY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          
          {/* 1. Net Worth (Big Card) - ALWAYS ALL TIME */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white shadow-lg sm:col-span-2 lg:col-span-1 relative overflow-hidden">
            <div className="flex justify-between items-start z-10 relative">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase">Net Worth</p>
                <h2 
                  onClick={() => setShowPrivacy(!showPrivacy)}
                  className={`text-2xl font-bold mt-1 cursor-pointer transition-all duration-300 ${showPrivacy ? 'blur-0' : 'blur-md'}`}
                >
                  KES {totals.balance.toLocaleString()}
                </h2>
                <p className="text-[10px] text-slate-500 mt-1">Total Accumulated Wealth</p>
              </div>
              <div className="p-2 bg-slate-700 rounded-lg"><Wallet size={20} className="text-white"/></div>
            </div>
          </div>

          {/* 2. Income */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-1">
              <p className="text-gray-500 text-xs font-bold uppercase">Income</p>
              <TrendingUp size={16} className="text-green-500"/>
            </div>
            <h2 className={`text-xl font-bold text-green-600 transition-all ${showPrivacy ? 'blur-0' : 'blur-sm'}`}>
              + {totals.income.toLocaleString()}
            </h2>
            <p className="text-[10px] text-gray-400 mt-1 uppercase">{dateFilter.replace('_', ' ')}</p>
          </div>

          {/* 3. Expenses */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-1">
              <p className="text-gray-500 text-xs font-bold uppercase">Expenses</p>
              <TrendingDown size={16} className="text-red-500"/>
            </div>
            <h2 className={`text-xl font-bold text-red-600 transition-all ${showPrivacy ? 'blur-0' : 'blur-sm'}`}>
              - {totals.expense.toLocaleString()}
            </h2>
            <p className="text-[10px] text-gray-400 mt-1 uppercase">{dateFilter.replace('_', ' ')}</p>
          </div>

          {/* 4. Savings */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-1">
              <p className="text-gray-500 text-xs font-bold uppercase">Savings</p>
              <PiggyBank size={16} className="text-cyan-500"/>
            </div>
            <h2 className={`text-xl font-bold text-cyan-600 transition-all ${showPrivacy ? 'blur-0' : 'blur-sm'}`}>
              {totals.savings.toLocaleString()}
            </h2>
            <p className="text-[10px] text-gray-400 mt-1 uppercase">{dateFilter.replace('_', ' ')}</p>
          </div>

          {/* 5. Investments */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-1">
              <p className="text-gray-500 text-xs font-bold uppercase">Invest</p>
              <Briefcase size={16} className="text-purple-500"/>
            </div>
            <h2 className={`text-xl font-bold text-purple-600 transition-all ${showPrivacy ? 'blur-0' : 'blur-sm'}`}>
              {totals.investment.toLocaleString()}
            </h2>
            <p className="text-[10px] text-gray-400 mt-1 uppercase">{dateFilter.replace('_', ' ')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Intelligence & Actions */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <h3 className="text-blue-900 font-semibold flex items-center gap-2 mb-4">
                <Lightbulb size={20} className="text-brand-orange"/> Insights
              </h3>
              <div className="space-y-3">
                {insights.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-blue-800">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                    <p>{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button onClick={() => setShowModal(true)} className="w-full flex items-center justify-center py-3 bg-brand-navy text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
                  <Plus size={18} className="mr-2"/> Add New Record
                </button>
                <button onClick={() => navigate('/transactions')} className="w-full flex items-center justify-center py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <List size={18} className="mr-2"/> View Full History
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Big Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <PieIcon size={20} className="text-brand-navy"/> Financial Distribution
              </h3>
              <div className="flex flex-wrap bg-gray-100 p-1 rounded-lg">
                {['OVERALL', 'EXPENSE', 'INCOME', 'SAVINGS', 'INVESTMENT'].map(type => (
                  <button 
                    key={type} 
                    onClick={() => handleChartToggle(type)} 
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-md uppercase transition-all ${
                      activeChart === type ? 'bg-white shadow text-brand-navy' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 min-h-[300px] w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie 
                    data={chartData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value"
                  >
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={getSliceColor(entry, index)} />)}
                  </Pie>
                  <Tooltip 
                     formatter={(value) => showPrivacy ? `KES ${value.toLocaleString()}` : '***'}
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <AddTransactionModal isOpen={showModal} onClose={() => setShowModal(false)} userId={user?.id} onSuccess={() => {
         // Reload data when modal closes successfully
         const fetchData = async () => {
            const { data } = await supabase.from('transactions').select('amount, type, category, date, is_initial').order('date', { ascending: false });
            setRawTransactions(data || []);
         };
         fetchData();
      }} />
    </AppLayout>
  );
};
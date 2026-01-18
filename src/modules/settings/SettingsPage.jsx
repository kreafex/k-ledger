import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus } from 'lucide-react';
import { AppLayout } from '../dashboard/AppLayout'; // <--- USING THE MASTER LAYOUT

export const SettingsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState([]);
  
  // Custom Category Logic
  const [isCustomTarget, setIsCustomTarget] = useState(false);

  const [newRule, setNewRule] = useState({
    target_category: 'Total Expense',
    condition: 'greater',
    amount: '',
    value_type: 'currency', 
    timeframe: 'Monthly',   
    message: ''
  });

  useEffect(() => {
    const fetchRules = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }
      const { data } = await supabase.from('rules').select('*').eq('owner_id', user.id);
      setRules(data || []);
      setLoading(false);
    };
    fetchRules();
  }, [navigate]);

  const handleAddRule = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Ensure amount is a number
    const amountVal = parseFloat(newRule.amount);
    if (isNaN(amountVal)) return alert("Please enter a valid amount");

    const { data, error } = await supabase.from('rules').insert([{
        owner_id: user.id,
        target_category: newRule.target_category,
        condition: newRule.condition,
        amount: amountVal,
        value_type: newRule.value_type,
        timeframe: newRule.timeframe,
        message: newRule.message
      }]).select();

    if (error) alert(error.message);
    else {
      setRules([...rules, data[0]]);
      setNewRule({ ...newRule, amount: '', message: '' });
    }
  };

  const handleDelete = async (id) => {
    await supabase.from('rules').delete().eq('id', id);
    setRules(rules.filter(r => r.id !== id));
  };

  const handleTargetChange = (e) => {
    if (e.target.value === 'CUSTOM') {
      setIsCustomTarget(true);
      setNewRule({ ...newRule, target_category: '' });
    } else {
      setIsCustomTarget(false);
      setNewRule({ ...newRule, target_category: e.target.value });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-navy">Smart Rules Engine</h1>
          <p className="text-gray-500">Teach K-Ledger how to analyze your spending.</p>
        </div>

        {/* Rule Creator */}
        <div className="bg-white shadow rounded-lg p-6 mb-8 border-t-4 border-brand-orange">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create a New Rule</h3>
          <form onSubmit={handleAddRule} className="space-y-6">
            
            {/* ROW 1: Logic */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              
              {/* Target Category */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700">If...</label>
                {isCustomTarget ? (
                  <div className="flex mt-1">
                    <input type="text" placeholder="Type Category..." className="block w-full p-2 border border-gray-300 rounded-l-md text-sm outline-none focus:border-brand-navy" value={newRule.target_category} onChange={e => setNewRule({...newRule, target_category: e.target.value})} />
                    <button type="button" onClick={() => setIsCustomTarget(false)} className="px-2 border border-l-0 rounded-r-md bg-gray-50 hover:bg-gray-100">X</button>
                  </div>
                ) : (
                  <select className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm outline-none focus:border-brand-navy" value={newRule.target_category} onChange={handleTargetChange}>
                    <option>Total Expense</option>
                    <option>Total Income</option>
                    <option>Savings Rate</option>
                    <option>Food</option>
                    <option>Rent</option>
                    <option value="CUSTOM" className="text-brand-orange font-bold">+ Custom Category...</option>
                  </select>
                )}
              </div>

              {/* Timeframe */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Timeline</label>
                <select className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm outline-none focus:border-brand-navy" value={newRule.timeframe} onChange={e => setNewRule({...newRule, timeframe: e.target.value})}>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Yearly</option>
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Condition</label>
                <select className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm outline-none focus:border-brand-navy" value={newRule.condition} onChange={e => setNewRule({...newRule, condition: e.target.value})}>
                  <option value="greater">Greater Than {'>'}</option>
                  <option value="less">Less Than {'<'}</option>
                </select>
              </div>

              {/* Value Type */}
              <div className="flex bg-gray-100 p-1 rounded-md h-[38px] items-center">
                  <button type="button" onClick={() => setNewRule({...newRule, value_type: 'currency'})} className={`flex-1 h-full text-xs font-medium rounded transition-all ${newRule.value_type === 'currency' ? 'bg-white shadow text-brand-navy' : 'text-gray-500'}`}>KES</button>
                  <button type="button" onClick={() => setNewRule({...newRule, value_type: 'percent'})} className={`flex-1 h-full text-xs font-medium rounded transition-all ${newRule.value_type === 'percent' ? 'bg-white shadow text-brand-orange' : 'text-gray-500'}`}>%</button>
              </div>

            </div>

            {/* ROW 2: Amount & Message */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-gray-700">Value Amount</label>
                <input type="number" required placeholder="e.g. 5000" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm outline-none focus:border-brand-navy" value={newRule.amount} onChange={e => setNewRule({...newRule, amount: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Alert Message</label>
                <input type="text" required placeholder="e.g. Stop spending so much!" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm outline-none focus:border-brand-navy" value={newRule.message} onChange={e => setNewRule({...newRule, message: e.target.value})} />
              </div>
            </div>

            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-navy hover:bg-slate-800 transition-colors">
              <Plus size={16} className="mr-2" /> Save Rule
            </button>
          </form>
        </div>

        {/* Rules List */}
        <h3 className="text-lg font-medium text-gray-900 mb-4">Active Rules</h3>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {rules.length === 0 ? (
              <p className="p-6 text-center text-gray-500">No rules yet.</p>
            ) : (
              rules.map((rule) => (
                <li key={rule.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">{rule.timeframe}</span>
                      <p className="text-sm font-bold text-brand-navy">
                        If <span className="text-brand-orange">{rule.target_category}</span> {rule.condition === 'greater' ? '>' : '<'} 
                        {rule.value_type === 'percent' ? ` ${rule.amount}%` : ` KES ${Number(rule.amount).toLocaleString()}`}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">"{rule.message}"</p>
                  </div>
                  <button onClick={() => handleDelete(rule.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </AppLayout>
  );
};
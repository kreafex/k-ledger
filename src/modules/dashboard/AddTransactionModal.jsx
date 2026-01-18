import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { X } from 'lucide-react';

export const AddTransactionModal = ({ isOpen, onClose, onSuccess, userId, transactionToEdit }) => {
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Default empty state
  const defaultState = {
    amount: '',
    type: 'expense', // Default to expense
    category: 'Food',
    frequency: 'One-time',
    description: '',
    date: today
  };

  const [formData, setFormData] = useState(defaultState);

  useEffect(() => {
    if (isOpen) {
      if (transactionToEdit) {
        setFormData({
          amount: transactionToEdit.amount,
          type: transactionToEdit.type,
          category: transactionToEdit.category,
          frequency: transactionToEdit.frequency || 'One-time',
          description: transactionToEdit.description || '',
          date: new Date(transactionToEdit.date).toISOString().split('T')[0]
        });
        
        // Custom category check
        const standardCats = [
          'Savings', 'Emergency Fund', 'Vacation', 'Gadgets', 
          'Salary', 'Business', 'Side Hustle', 'Gifts', 
          'Food', 'Rent', 'Transport', 'Entertainment', 'Shopping', 'Bills',
          'Stocks (NSE)', 'MMF', 'Crypto', 'Land', 'Business Capital'
        ];
        setIsCustomCategory(!standardCats.includes(transactionToEdit.category));
      } else {
        setFormData(defaultState);
        setIsCustomCategory(false);
      }
    }
  }, [isOpen, transactionToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        frequency: formData.frequency,
        description: formData.description,
        date: new Date(formData.date).toISOString()
      };

      if (transactionToEdit) {
        // Update Logic
        await supabase.from('transactions').update(payload).eq('id', transactionToEdit.id);
      } else {
        // Insert Logic
        // Fetch org_id if needed, or insert with owner_id
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('transactions').insert([{ ...payload, owner_id: user.id }]); 
      }

      onSuccess();
      onClose();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="relative mx-auto p-6 border w-full max-w-md shadow-2xl rounded-xl bg-white">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {transactionToEdit ? 'Edit Transaction' : 'New Transaction'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* TYPE TOGGLES - UPDATED WITH SAVINGS */}
          <div className="flex rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <button type="button" onClick={() => setFormData({ ...formData, type: 'income' })} className={`flex-1 py-2 text-[10px] sm:text-xs font-bold ${formData.type === 'income' ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>INCOME</button>
            <button type="button" onClick={() => setFormData({ ...formData, type: 'expense' })} className={`flex-1 py-2 text-[10px] sm:text-xs font-bold border-l border-r border-gray-200 ${formData.type === 'expense' ? 'bg-red-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>EXPENSE</button>
            <button type="button" onClick={() => setFormData({ ...formData, type: 'savings' })} className={`flex-1 py-2 text-[10px] sm:text-xs font-bold border-r border-gray-200 ${formData.type === 'savings' ? 'bg-cyan-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>SAVINGS</button>
            <button type="button" onClick={() => setFormData({ ...formData, type: 'investment' })} className={`flex-1 py-2 text-[10px] sm:text-xs font-bold ${formData.type === 'investment' ? 'bg-purple-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>INVEST</button>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-xs font-bold text-gray-500 mb-1">Date</label>
              <input type="date" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy outline-none" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div className="w-1/2">
              <label className="block text-xs font-bold text-gray-500 mb-1">Amount</label>
              <input type="number" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy outline-none" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Category</label>
            {isCustomCategory ? (
              <div className="flex">
                <input type="text" autoFocus className="block w-full px-3 py-2 border border-gray-300 rounded-l-lg text-sm outline-none focus:ring-2 focus:ring-brand-navy" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Type custom category..." />
                <button type="button" onClick={() => { setIsCustomCategory(false); setFormData({ ...formData, category: '' }); }} className="px-3 border border-l-0 rounded-r-lg bg-gray-50 text-gray-500 hover:bg-gray-200">X</button>
              </div>
            ) : (
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy outline-none" value={formData.category} onChange={(e) => {
                if(e.target.value === 'CUSTOM') { setIsCustomCategory(true); setFormData({...formData, category: ''}); }
                else setFormData({...formData, category: e.target.value});
              }}>
                {formData.type === 'income' && <><option>Salary</option><option>Business</option><option>Side Hustle</option><option>Gifts</option></>}
                {formData.type === 'expense' && <><option>Food</option><option>Rent</option><option>Transport</option><option>Entertainment</option><option>Shopping</option><option>Bills</option></>}
                
                {/* NEW SAVINGS CATEGORIES */}
                {formData.type === 'savings' && <><option>Emergency Fund</option><option>Vacation</option><option>New Laptop</option><option>Car Fund</option><option>General Savings</option></>}
                
                {formData.type === 'investment' && <><option>Stocks (NSE)</option><option>MMF</option><option>Crypto</option><option>Land</option><option>Business Capital</option></>}
                
                <option value="CUSTOM" className="font-bold text-brand-orange">+ Custom...</option>
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Frequency</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy outline-none" value={formData.frequency} onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}>
                <option>One-time</option><option>Daily</option><option>Weekly</option><option>Monthly</option><option>Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy outline-none" placeholder="What was this for?" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg text-sm font-bold text-white bg-brand-navy hover:bg-slate-800 transition-colors shadow-lg">
            {loading ? 'Saving...' : (transactionToEdit ? 'Update Transaction' : 'Save Transaction')}
          </button>
        </form>
      </div>
    </div>
  );
};
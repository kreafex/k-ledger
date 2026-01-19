import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { X, Wallet } from 'lucide-react';

export const AddTransactionModal = ({ isOpen, onClose, onSuccess, userId, transactionToEdit }) => {
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Default empty state
  const defaultState = {
    amount: '',
    type: 'expense', 
    category: 'Food',
    account: 'M-Pesa', // <--- NEW: Default Account
    is_initial: false, // <--- NEW: Flag for Opening Balance
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
          account: transactionToEdit.account || 'Cash', // Handle old records
          is_initial: transactionToEdit.is_initial || false,
          frequency: transactionToEdit.frequency || 'One-time',
          description: transactionToEdit.description || '',
          date: new Date(transactionToEdit.date).toISOString().split('T')[0]
        });
        
        // Check if category is standard
        const standardCats = [
          'Salary', 'Business', 'Side Hustle', 'Gifts', 
          'Food', 'Rent', 'Transport', 'Entertainment', 'Shopping', 'Bills',
          'Emergency Fund', 'Vacation', 'New Laptop', 'Car Fund', 'General Savings',
          'Stocks (NSE)', 'MMF', 'Crypto', 'Land', 'Business Capital',
          'Opening Balance' // <--- We treat this as a standard category now
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

    const finalAmount = parseFloat(formData.amount);
    if (isNaN(finalAmount) || finalAmount <= 0) {
        alert("Please enter a valid amount greater than 0");
        setLoading(false);
        return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert("Please login again."); setLoading(false); return; }

      // If "Opening Balance" is checked, force the category to "Opening Balance"
      const finalCategory = formData.is_initial ? 'Opening Balance' : formData.category;
      const finalDesc = formData.is_initial ? 'Starting Balance' : formData.description;

      const payload = {
        amount: finalAmount,
        type: formData.type,
        category: finalCategory,
        account: formData.account, // <--- Saving the Account
        is_initial: formData.is_initial, // <--- Saving the Flag
        frequency: formData.frequency,
        description: finalDesc,
        date: new Date(formData.date).toISOString(),
        owner_id: user.id 
      };

      if (transactionToEdit) {
        await supabase.from('transactions').update(payload).eq('id', transactionToEdit.id);
      } else {
        await supabase.from('transactions').insert([payload]); 
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-[200] backdrop-blur-sm">
      <div className="relative mx-auto p-6 border w-full max-w-md shadow-2xl rounded-xl bg-white">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {transactionToEdit ? 'Edit Record' : 'New Record'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* 1. TYPE TOGGLES (Removed INITIAL, added Checkbox logic below) */}
          <div className="flex rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <button type="button" onClick={() => setFormData({ ...formData, type: 'income' })} className={`flex-1 py-2 text-[10px] sm:text-xs font-bold ${formData.type === 'income' ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>INCOME</button>
            <button type="button" onClick={() => setFormData({ ...formData, type: 'expense' })} className={`flex-1 py-2 text-[10px] sm:text-xs font-bold border-l border-gray-200 ${formData.type === 'expense' ? 'bg-red-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>EXPENSE</button>
            <button type="button" onClick={() => setFormData({ ...formData, type: 'savings' })} className={`flex-1 py-2 text-[10px] sm:text-xs font-bold border-l border-gray-200 ${formData.type === 'savings' ? 'bg-cyan-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>SAVINGS</button>
            <button type="button" onClick={() => setFormData({ ...formData, type: 'investment' })} className={`flex-1 py-2 text-[10px] sm:text-xs font-bold border-l border-gray-200 ${formData.type === 'investment' ? 'bg-purple-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>INVEST</button>
          </div>

          {/* 2. THE NEW "ACCOUNT" SELECTOR & INITIAL CHECKBOX */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
             
             {/* Account Selector */}
             <div className="mb-3">
                <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">
                   <Wallet size={12}/> {formData.type === 'expense' ? 'Paid From' : 'Deposited To'}
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-navy outline-none" value={formData.account} onChange={(e) => setFormData({ ...formData, account: e.target.value })}>
                    <option>M-Pesa</option>
                    <option>Cash</option>
                    <option>Equity Bank</option>
                    <option>KCB</option>
                    <option>Co-op Bank</option>
                    <option>M-Shwari</option>
                    <option>MMF (Savings)</option>
                    <option>Binance</option>
                    <option>Sacco</option>
                </select>
             </div>

             {/* The "Initial Balance" Checkbox */}
             {formData.type !== 'expense' && (
                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="isInitial"
                        checked={formData.is_initial}
                        onChange={(e) => setFormData({...formData, is_initial: e.target.checked})}
                        className="w-4 h-4 text-brand-navy rounded focus:ring-brand-navy"
                    />
                    <label htmlFor="isInitial" className="text-sm text-gray-700 font-medium">
                        This is my starting balance
                    </label>
                </div>
             )}
          </div>

          {/* 3. AMOUNT & DATE */}
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

          {/* 4. CATEGORY (Hidden if "Starting Balance" is checked) */}
          {!formData.is_initial && (
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Category</label>
                {isCustomCategory ? (
                <div className="flex">
                    <input type="text" autoFocus className="block w-full px-3 py-2 border border-gray-300 rounded-l-lg text-sm outline-none focus:ring-2 focus:ring-brand-navy" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Type category..." />
                    <button type="button" onClick={() => { setIsCustomCategory(false); setFormData({ ...formData, category: '' }); }} className="px-3 border border-l-0 rounded-r-lg bg-gray-50 text-gray-500 hover:bg-gray-200">X</button>
                </div>
                ) : (
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy outline-none" value={formData.category} onChange={(e) => {
                    if(e.target.value === 'CUSTOM') { setIsCustomCategory(true); setFormData({...formData, category: ''}); }
                    else setFormData({...formData, category: e.target.value});
                }}>
                    {/* Dynamic Options based on Type */}
                    {formData.type === 'income' && <><option>Salary</option><option>Business</option><option>Side Hustle</option><option>Gifts</option></>}
                    {formData.type === 'expense' && <><option>Food</option><option>Rent</option><option>Transport</option><option>Entertainment</option><option>Shopping</option><option>Bills</option></>}
                    {formData.type === 'savings' && <><option>Emergency Fund</option><option>Vacation</option><option>New Laptop</option><option>General Savings</option></>}
                    {formData.type === 'investment' && <><option>Stocks (NSE)</option><option>MMF</option><option>Crypto</option><option>Land</option><option>Business Capital</option></>}
                    
                    <option value="CUSTOM" className="font-bold text-brand-orange">+ Custom...</option>
                </select>
                )}
            </div>
          )}

          {/* 5. DESCRIPTION */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy outline-none" placeholder={formData.is_initial ? "e.g. Balance as of Jan 1st" : "What was this for?"} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg text-sm font-bold text-white bg-brand-navy hover:bg-slate-800 transition-colors shadow-lg">
            {loading ? 'Saving...' : 'Save Record'}
          </button>
        </form>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { X, Wallet, ArrowRightLeft } from 'lucide-react';

export const AddTransactionModal = ({ isOpen, onClose, onSuccess, userId, transactionToEdit }) => {
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Default empty state
  const defaultState = {
    amount: '',
    type: 'expense', 
    category: 'Food',
    account: 'M-Pesa',      
    to_account: 'Cash',    
    is_initial: false, 
    frequency: 'One-time',
    description: '',
    date: today
  };

  const [formData, setFormData] = useState(defaultState);

  useEffect(() => {
    if (isOpen) {
      if (transactionToEdit) {
        setFormData({
          ...defaultState,
          amount: Math.abs(transactionToEdit.amount),
          type: transactionToEdit.type,
          category: transactionToEdit.category,
          account: transactionToEdit.account || 'M-Pesa',
          is_initial: transactionToEdit.is_initial || false,
          frequency: transactionToEdit.frequency || 'One-time',
          description: transactionToEdit.description || '',
          date: new Date(transactionToEdit.date).toISOString().split('T')[0]
        });
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

      // --- 1. HANDLE EDIT (UPDATE) ---
      if (transactionToEdit) {
        // When editing, we treat transfers as single records to keep it simple
        const updatePayload = {
            amount: formData.type === 'expense' || (formData.type === 'transfer' && transactionToEdit.amount < 0) ? -finalAmount : finalAmount,
            type: formData.type,
            category: formData.category,
            account: formData.account,
            description: formData.description,
            date: new Date(formData.date).toISOString(),
            is_initial: formData.is_initial
        };

        const { error } = await supabase
            .from('transactions')
            .update(updatePayload)
            .eq('id', transactionToEdit.id);
            
        if (error) throw error;

      } 
      // --- 2. HANDLE NEW (INSERT) ---
      else {
          const recordsToInsert = [];

          if (formData.type === 'transfer') {
            // Withdrawal
            recordsToInsert.push({
                amount: -finalAmount, 
                type: 'transfer',
                category: 'Transfer',
                account: formData.account, 
                description: `Transfer to ${formData.to_account}`,
                date: new Date(formData.date).toISOString(),
                owner_id: user.id
            });
            // Deposit
            recordsToInsert.push({
                amount: finalAmount, 
                type: 'transfer',
                category: 'Transfer',
                account: formData.to_account, 
                description: `Transfer from ${formData.account}`,
                date: new Date(formData.date).toISOString(),
                owner_id: user.id
            });
          } else {
            // Regular Transaction
            const finalCategory = formData.is_initial ? 'Opening Balance' : formData.category;
            const finalDesc = formData.is_initial ? 'Starting Balance' : formData.description;
            
            // Note: Expenses are typically negative, but your app logic handles signs in the Dashboard.
            // However, to keep Transfers consistent, we might want to store Expenses as negative eventually.
            // For now, we stick to your current Positive-Number convention for consistency.
            recordsToInsert.push({
                amount: finalAmount,
                type: formData.type,
                category: finalCategory,
                account: formData.account,
                is_initial: formData.is_initial,
                frequency: formData.frequency,
                description: finalDesc,
                date: new Date(formData.date).toISOString(),
                owner_id: user.id
            });
          }

          const { error } = await supabase.from('transactions').insert(recordsToInsert);
          if (error) throw error;
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
          
          {/* TYPE TOGGLES */}
          <div className="flex rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <button type="button" onClick={() => setFormData({ ...formData, type: 'income' })} className={`flex-1 py-2 text-[10px] sm:text-xs font-bold ${formData.type === 'income' ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>INCOME</button>
            <button type="button" onClick={() => setFormData({ ...formData, type: 'expense' })} className={`flex-1 py-2 text-[10px] sm:text-xs font-bold border-l border-gray-200 ${formData.type === 'expense' ? 'bg-red-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>EXPENSE</button>
            <button type="button" onClick={() => setFormData({ ...formData, type: 'transfer' })} className={`flex-1 py-2 text-[10px] sm:text-xs font-bold border-l border-gray-200 ${formData.type === 'transfer' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>TRANSFER</button>
            <button type="button" onClick={() => setFormData({ ...formData, type: 'savings' })} className={`flex-1 py-2 text-[10px] sm:text-xs font-bold border-l border-gray-200 ${formData.type === 'savings' ? 'bg-cyan-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>SAVING</button>
            <button type="button" onClick={() => setFormData({ ...formData, type: 'investment' })} className={`flex-1 py-2 text-[10px] sm:text-xs font-bold border-l border-gray-200 ${formData.type === 'investment' ? 'bg-purple-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>INVEST</button>
          </div>

          {/* FORM LOGIC */}
          {formData.type === 'transfer' && !transactionToEdit ? (
             <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
                <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1">From Account (Withdraw)</label>
                   <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none" value={formData.account} onChange={(e) => setFormData({ ...formData, account: e.target.value })}>
                       <option>M-Pesa</option><option>Cash</option><option>Equity Bank</option><option>KCB</option><option>Co-op Bank</option><option>M-Shwari</option><option>MMF (Savings)</option>
                   </select>
                </div>
                <div className="flex justify-center"><ArrowRightLeft size={20} className="text-blue-400"/></div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1">To Account (Deposit)</label>
                   <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none" value={formData.to_account} onChange={(e) => setFormData({ ...formData, to_account: e.target.value })}>
                       <option>Cash</option><option>M-Pesa</option><option>Equity Bank</option><option>KCB</option><option>Co-op Bank</option><option>M-Shwari</option><option>MMF (Savings)</option>
                   </select>
                </div>
             </div>
          ) : (
             <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="mb-3">
                   <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">
                      <Wallet size={12}/> {formData.type === 'expense' ? 'Paid From' : 'Deposited To'}
                   </label>
                   <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-navy outline-none" value={formData.account} onChange={(e) => setFormData({ ...formData, account: e.target.value })}>
                       <option>M-Pesa</option><option>Cash</option><option>Equity Bank</option><option>KCB</option><option>Co-op Bank</option><option>M-Shwari</option><option>MMF (Savings)</option><option>Binance</option><option>Sacco</option>
                   </select>
                </div>
                {formData.type !== 'expense' && formData.type !== 'transfer' && (
                   <div className="flex items-center gap-2">
                       <input type="checkbox" id="isInitial" checked={formData.is_initial} onChange={(e) => setFormData({...formData, is_initial: e.target.checked})} className="w-4 h-4 text-brand-navy rounded focus:ring-brand-navy"/>
                       <label htmlFor="isInitial" className="text-sm text-gray-700 font-medium">This is my starting balance</label>
                   </div>
                )}
             </div>
          )}

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

          {formData.type !== 'transfer' && !formData.is_initial && (
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
                    {formData.type === 'income' && <><option>Salary</option><option>Business</option><option>Side Hustle</option><option>Gifts</option></>}
                    {formData.type === 'expense' && <><option>Food</option><option>Rent</option><option>Transport</option><option>Entertainment</option><option>Shopping</option><option>Bills</option></>}
                    {formData.type === 'savings' && <><option>Emergency Fund</option><option>Vacation</option><option>New Laptop</option><option>General Savings</option></>}
                    {formData.type === 'investment' && <><option>Stocks (NSE)</option><option>MMF</option><option>Crypto</option><option>Land</option><option>Business Capital</option></>}
                    <option value="CUSTOM" className="font-bold text-brand-orange">+ Custom...</option>
                </select>
                )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy outline-none" placeholder={formData.type === 'transfer' ? "e.g. Moving savings" : "What was this for?"} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg text-sm font-bold text-white bg-brand-navy hover:bg-slate-800 transition-colors shadow-lg">
            {loading ? 'Saving...' : (transactionToEdit ? 'Update Transaction' : 'Save Transaction')}
          </button>
        </form>
      </div>
    </div>
  );
};
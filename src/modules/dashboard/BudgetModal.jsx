import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { X } from 'lucide-react';

export const BudgetModal = ({ isOpen, onClose, onSuccess, userId }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Food',
    amount: '',
    period: 'Monthly'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('budgets').insert([{
        owner_id: userId,
        category: formData.category,
        amount: parseFloat(formData.amount),
        period: formData.period
      }]);

      if (error) throw error;
      onSuccess();
      onClose();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // UPDATED: Changed z-50 to z-[300] to ensure it sits on top of Sidebar/Header
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-[300]">
      <div className="relative mx-auto p-5 border w-full max-w-sm shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Set New Budget</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm bg-white" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
              <option>Food</option>
              <option>Transport</option>
              <option>Rent</option>
              <option>Entertainment</option>
              <option>Shopping</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Limit Amount (KES)</label>
            <input type="number" required placeholder="e.g. 20000" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Period</label>
            <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm bg-white" value={formData.period} onChange={(e) => setFormData({ ...formData, period: e.target.value })}>
              <option>Monthly</option>
              <option>Weekly</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-navy hover:bg-slate-800 transition-colors">
            {loading ? 'Saving...' : 'Set Budget'}
          </button>
        </form>
      </div>
    </div>
  );
};
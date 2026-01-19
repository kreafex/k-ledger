import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { AddTransactionModal } from '../dashboard/AddTransactionModal';
import { AppLayout } from '../dashboard/AppLayout'; 

export const TransactionsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const loadTransactions = async (userId) => {
    const { data } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    setTransactions(data || []);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }
      setUser(user);
      await loadTransactions(user.id);
    };
    init();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (confirm("Permanently delete this record?")) {
      await supabase.from('transactions').delete().eq('id', id);
      loadTransactions(user.id);
    }
  };

  const handleEdit = (t) => { setEditingTransaction(t); setShowModal(true); };

  const filteredData = transactions.filter(t => {
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || t.type.toUpperCase() === filterType;
    return matchesSearch && matchesType;
  });

  // Helper to determine if a transaction is "Positive" (Money In)
  const isPositive = (type) => ['income', 'initial'].includes(type);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">Transaction Log</h1>
            <p className="text-gray-500 text-sm">View, search, and manage your financial history.</p>
          </div>
          <button onClick={() => { setEditingTransaction(null); setShowModal(true); }} className="flex items-center px-4 py-2 bg-brand-navy text-white rounded-md hover:bg-slate-800 shadow">
            <Plus size={18} className="mr-2" /> Add Record
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4 items-center">
          
          {/* SEARCH */}
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-navy outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          
          {/* FILTER BUTTONS (Added INITIAL) */}
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {['ALL', 'INCOME', 'EXPENSE', 'SAVINGS', 'INVESTMENT', 'INITIAL'].map(type => (
              <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-2 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${filterType === type ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{type}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400 text-sm">No records found.</td></tr>
                ) : (
                  filteredData.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${t.type === 'income' ? 'bg-green-100 text-green-800' : 
                            t.type === 'expense' ? 'bg-red-100 text-red-800' : 
                            t.type === 'savings' ? 'bg-cyan-100 text-cyan-800' : 
                            t.type === 'initial' ? 'bg-teal-100 text-teal-800' : 
                            'bg-purple-100 text-purple-800'}`}>
                          {t.category}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                        {t.description || '-'} <span className="text-gray-400 text-xs">({t.frequency || 'One-time'})</span>
                      </td>
                      
                      {/* FIXED AMOUNT DISPLAY LOGIC */}
                      <td className={`px-6 py-4 text-sm text-right font-bold whitespace-nowrap
                        ${isPositive(t.type) ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive(t.type) ? '+' : '-'} {Number(t.amount).toLocaleString()}
                      </td>
                      
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                          <div className="flex justify-center gap-2">
                           <button onClick={() => handleEdit(t)} className="text-blue-600 hover:text-blue-800 p-1"><Pencil size={16} /></button>
                           <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 size={16} /></button>
                          </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <AddTransactionModal isOpen={showModal} onClose={() => setShowModal(false)} userId={user?.id} onSuccess={() => loadTransactions(user.id)} transactionToEdit={editingTransaction} />
    </AppLayout>
  );
};
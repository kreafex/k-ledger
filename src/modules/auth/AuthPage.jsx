import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom';
import { Wallet, Loader2 } from 'lucide-react'; // Using standard icons to prevent build errors

export const AuthPage = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState('personal'); // 'personal' or 'business'
  
  // Track First and Last name separately
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    businessName: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // --- SIGN UP LOGIC ---
        // Combine First + Last to create the "Full Name"
        const combinedName = `${formData.firstName} ${formData.lastName}`;
        const orgName = accountType === 'business' 
          ? formData.businessName 
          : `${formData.firstName}'s Personal`; // e.g. "Macharia's Personal"

        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: combinedName,
              account_type: accountType,
              org_name: orgName
            }
          }
        });
        if (error) throw error;
        alert('Success! Check your email for the confirmation link.');
      } else {
        // --- LOGIN LOGIC ---
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        
        // SUCCESS! Send them to the dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-brand-navy p-3 rounded-xl">
             <Wallet className="h-10 w-10 text-white" /> 
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-brand-navy">
          {isSignUp ? 'Create your account' : 'Sign in to K-Ledger'}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
           {isSignUp ? 'Start managing your wealth today' : 'Welcome back'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10 border-t-4 border-brand-orange">
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Account Type Toggle (Only for Sign Up) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">I want to manage:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType('personal')}
                    className={`flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-bold transition-all ${
                      accountType === 'personal'
                        ? 'bg-brand-navy text-white border-brand-navy'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Personal
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('business')}
                    className={`flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-bold transition-all ${
                      accountType === 'business'
                        ? 'bg-brand-orange text-white border-brand-orange'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Business
                  </button>
                </div>
              </div>
            )}

            {/* First Name and Last Name Side-by-Side */}
            {isSignUp && (
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-orange focus:border-brand-orange sm:text-sm"
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-orange focus:border-brand-orange sm:text-sm"
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
            )}

            {isSignUp && accountType === 'business' && (
               <div>
               <label className="block text-sm font-medium text-gray-700">Business Name</label>
               <input
                 type="text"
                 required
                 placeholder="e.g. Kreafex Systems"
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-orange focus:border-brand-orange sm:text-sm"
                 onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
               />
             </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-orange focus:border-brand-orange sm:text-sm"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-orange focus:border-brand-orange sm:text-sm"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all
              ${isSignUp && accountType === 'business' ? 'bg-brand-orange hover:bg-orange-600' : 'bg-brand-navy hover:bg-slate-800'}
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange`}
            >
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : null}
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isSignUp ? 'Already have an account?' : 'New to K-Ledger?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                {isSignUp ? 'Sign In instead' : 'Create an account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
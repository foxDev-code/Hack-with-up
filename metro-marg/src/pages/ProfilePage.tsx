import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { GlassCard, GlassButton } from '@/components/GlassComponents';
import { supabase, Profile, Transaction } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  User, 
  CreditCard, 
  TrendingUp, 
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet
} from 'lucide-react';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [recharging, setRecharging] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/profile');
      return;
    }
    fetchProfileData();
  }, [user, navigate]);

  async function fetchProfileData() {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      setProfile(profileData);

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setTransactions(transactionsData || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRecharge() {
    const amount = parseFloat(rechargeAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setRecharging(true);
    try {
      const { data, error } = await supabase.functions.invoke('recharge-card', {
        body: { amount }
      });

      if (error) throw error;

      alert('Recharge successful!');
      setRechargeAmount('');
      await fetchProfileData();
    } catch (error: any) {
      console.error('Recharge error:', error);
      alert('Recharge failed: ' + error.message);
    } finally {
      setRecharging(false);
    }
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <Navigation />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-neutral-700">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-12 text-center">
              My Profile
            </h1>

            {/* Profile Info */}
            <GlassCard variant="medium" className="p-8 mb-8">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-full bg-metro-blue-100 flex items-center justify-center">
                  <User className="w-10 h-10 text-metro-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">
                    {profile?.full_name || 'User'}
                  </h2>
                  <p className="text-neutral-700">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/20 rounded-lg">
                  <div className="text-sm text-neutral-700 mb-1">Metro Card Number</div>
                  <div className="font-mono font-semibold text-neutral-900">
                    {profile?.metro_card_number || 'Not assigned'}
                  </div>
                </div>
                <div className="p-4 bg-white/20 rounded-lg">
                  <div className="text-sm text-neutral-700 mb-1">Member Since</div>
                  <div className="font-semibold text-neutral-900">
                    {new Date(profile?.created_at || '').toLocaleDateString()}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Metro Card Balance */}
            <GlassCard variant="light" className="p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">
                  Metro Card Balance
                </h2>
                <Wallet className="w-8 h-8 text-metro-blue-500" />
              </div>

              <div className="text-5xl font-bold text-metro-blue-500 mb-8">
                Rs. {profile?.metro_card_balance?.toFixed(2) || '0.00'}
              </div>

              <div className="flex gap-4">
                <input
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="flex-1 h-14 px-4 bg-white/25 backdrop-blur-[10px] border border-white/30 rounded-md text-neutral-900 focus:outline-none focus:ring-2 focus:ring-metro-blue-500/40"
                  min="0"
                />
                <GlassButton
                  variant="primary"
                  onClick={handleRecharge}
                  disabled={recharging}
                  className="px-8"
                >
                  {recharging ? 'Processing...' : 'Recharge'}
                </GlassButton>
              </div>
            </GlassCard>

            {/* Transaction History */}
            <GlassCard variant="medium" className="p-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                Transaction History
              </h2>

              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-700">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        {transaction.amount > 0 ? (
                          <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
                            <ArrowUpCircle className="w-5 h-5 text-success-500" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-error-100 flex items-center justify-center">
                            <ArrowDownCircle className="w-5 h-5 text-error-500" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-neutral-900">
                            {transaction.description}
                          </div>
                          <div className="text-sm text-neutral-700">
                            {new Date(transaction.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          transaction.amount > 0 ? 'text-success-500' : 'text-error-500'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}Rs. {Math.abs(transaction.amount).toFixed(2)}
                        </div>
                        <div className="text-sm text-neutral-700">
                          Balance: Rs. {transaction.balance_after.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

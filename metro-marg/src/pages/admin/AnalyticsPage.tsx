import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { GlassCard } from '@/components/GlassComponents';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7days');
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalTickets: 0,
    averageTicketPrice: 0,
    totalRecharges: 0
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [ridershipData, setRidershipData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  function getDateRangeFilter() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateRange) {
      case 'today':
        return today.toISOString();
      case '7days':
        const week = new Date(today);
        week.setDate(week.getDate() - 7);
        return week.toISOString();
      case '30days':
        const month = new Date(today);
        month.setDate(month.getDate() - 30);
        return month.toISOString();
      case 'year':
        const year = new Date(today);
        year.setFullYear(year.getFullYear() - 1);
        return year.toISOString();
      default:
        return today.toISOString();
    }
  }

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const dateFilter = getDateRangeFilter();

      // Fetch tickets data
      const { data: ticketsData } = await supabase
        .from('tickets')
        .select('*')
        .gte('created_at', dateFilter)
        .order('created_at', { ascending: false });

      // Fetch transactions data (recharges)
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', dateFilter)
        .order('created_at', { ascending: false });

      if (!ticketsData || !transactionsData) {
        setLoading(false);
        return;
      }

      // Calculate key metrics
      const totalTicketRevenue = ticketsData.reduce((sum, t) => sum + parseFloat(t.fare || 0), 0);
      const totalRecharges = transactionsData
        .filter(t => t.transaction_type === 'recharge')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      const totalRevenue = totalTicketRevenue + totalRecharges;
      const avgPrice = ticketsData.length > 0 ? totalTicketRevenue / ticketsData.length : 0;

      setAnalytics({
        totalRevenue,
        totalTickets: ticketsData.length,
        averageTicketPrice: avgPrice,
        totalRecharges
      });

      // Generate daily revenue data from actual transactions
      const dailyRevenue = new Map<string, { tickets: number; revenue: number }>();
      
      // Process tickets
      ticketsData.forEach(ticket => {
        const date = new Date(ticket.created_at);
        const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const existing = dailyRevenue.get(dateKey) || { tickets: 0, revenue: 0 };
        dailyRevenue.set(dateKey, {
          tickets: existing.tickets + 1,
          revenue: existing.revenue + parseFloat(ticket.fare || 0)
        });
      });

      // Process recharges
      transactionsData
        .filter(t => t.transaction_type === 'recharge')
        .forEach(transaction => {
          const date = new Date(transaction.created_at);
          const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const existing = dailyRevenue.get(dateKey) || { tickets: 0, revenue: 0 };
          dailyRevenue.set(dateKey, {
            tickets: existing.tickets,
            revenue: existing.revenue + parseFloat(transaction.amount || 0)
          });
        });

      // Convert to array and sort by date
      const revenueArray = Array.from(dailyRevenue.entries())
        .map(([date, data]) => ({
          date,
          revenue: Math.round(data.revenue),
          tickets: data.tickets
        }))
        .slice(-7); // Last 7 days

      // If no data, show sample message
      if (revenueArray.length === 0) {
        const sampleData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: 0,
            tickets: 0
          };
        });
        setRevenueData(sampleData);
      } else {
        setRevenueData(revenueArray);
      }

      // Generate hourly ridership data from actual tickets
      const hourlyRidership = new Map<number, number>();
      
      ticketsData.forEach(ticket => {
        const date = new Date(ticket.created_at);
        const hour = date.getHours();
        hourlyRidership.set(hour, (hourlyRidership.get(hour) || 0) + 1);
      });

      const ridershipArray = Array.from({ length: 24 }, (_, hour) => ({
        hour: `${hour}:00`,
        passengers: hourlyRidership.get(hour) || 0
      }));

      setRidershipData(ridershipArray);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1);
  const maxPassengers = Math.max(...ridershipData.map(d => d.passengers), 1);

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-2">
                  Analytics & Reports
                </h1>
                <p className="text-lg text-neutral-700">
                  Real-time metro network performance insights
                </p>
              </div>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="h-14 px-4 bg-white/25 backdrop-blur-[10px] border border-white/30 rounded-md text-neutral-900 focus:outline-none focus:ring-2 focus:ring-metro-blue-500/40"
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="year">This Year</option>
              </select>
            </div>

            {loading ? (
              <GlassCard variant="medium" className="p-12 text-center">
                <div className="text-lg text-neutral-700">Loading analytics data...</div>
              </GlassCard>
            ) : (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <GlassCard variant="medium" className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-success-100 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-success-500" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-success-500" />
                    </div>
                    <div className="text-3xl font-bold text-neutral-900 mb-1">
                      Rs. {analytics.totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-neutral-700">Total Revenue</div>
                  </GlassCard>

                  <GlassCard variant="medium" className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-metro-blue-100 flex items-center justify-center">
                        <Users className="w-6 h-6 text-metro-blue-500" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-success-500" />
                    </div>
                    <div className="text-3xl font-bold text-neutral-900 mb-1">
                      {analytics.totalTickets.toLocaleString()}
                    </div>
                    <div className="text-sm text-neutral-700">Total Tickets Sold</div>
                  </GlassCard>

                  <GlassCard variant="medium" className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-metro-aqua-100 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-metro-aqua-500" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-success-500" />
                    </div>
                    <div className="text-3xl font-bold text-neutral-900 mb-1">
                      Rs. {Math.round(analytics.averageTicketPrice)}
                    </div>
                    <div className="text-sm text-neutral-700">Avg. Ticket Price</div>
                  </GlassCard>

                  <GlassCard variant="medium" className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-metro-yellow-100 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-metro-yellow-500" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-success-500" />
                    </div>
                    <div className="text-3xl font-bold text-neutral-900 mb-1">
                      Rs. {analytics.totalRecharges.toLocaleString()}
                    </div>
                    <div className="text-sm text-neutral-700">Metro Card Recharges</div>
                  </GlassCard>
                </div>

                {/* Revenue Chart */}
                <GlassCard variant="medium" className="p-6 mb-8">
                  <h2 className="text-xl font-bold text-neutral-900 mb-6">
                    Daily Revenue Trend
                  </h2>
                  {revenueData.some(d => d.revenue > 0) ? (
                    <div className="space-y-4">
                      {revenueData.map((data, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-neutral-900">{data.date}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-neutral-600">{data.tickets} tickets</span>
                              <span className="text-sm font-bold text-metro-blue-500">Rs. {data.revenue.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="w-full h-8 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-metro-blue-500 to-metro-aqua-500 rounded-full transition-all duration-500"
                              style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-neutral-600">
                      No revenue data available for the selected period
                    </div>
                  )}
                </GlassCard>

                {/* Ridership Chart */}
                <GlassCard variant="medium" className="p-6">
                  <h2 className="text-xl font-bold text-neutral-900 mb-6">
                    Hourly Ridership Pattern
                  </h2>
                  {ridershipData.some(d => d.passengers > 0) ? (
                    <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                      {ridershipData.map((data, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div className="w-full h-32 bg-neutral-200 rounded-t-lg overflow-hidden flex items-end">
                            <div
                              className="w-full bg-metro-aqua-500 transition-all duration-500"
                              style={{ height: `${(data.passengers / maxPassengers) * 100}%` }}
                              title={`${data.hour}: ${data.passengers} passengers`}
                            />
                          </div>
                          <span className="text-xs text-neutral-700 mt-1">{idx % 3 === 0 ? data.hour.split(':')[0] : ''}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-neutral-600">
                      No ridership data available for the selected period
                    </div>
                  )}
                </GlassCard>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

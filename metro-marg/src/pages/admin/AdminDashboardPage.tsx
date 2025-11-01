import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { GlassCard, MetroLineBadge, StatusDot } from '@/components/GlassComponents';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  Train as TrainIcon,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

export function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalTrains: 0,
    activeTrains: 0,
    totalStations: 0,
    todayPassengers: 0,
    todayRevenue: 0,
    operationalLines: 0
  });
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [trains, setTrains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // Fetch trains
      const { data: trainsData } = await supabase
        .from('trains')
        .select('*');

      // Fetch stations
      const { data: stationsData } = await supabase
        .from('stations')
        .select('*');

      // Fetch metro lines
      const { data: linesData } = await supabase
        .from('metro_lines')
        .select('*')
        .eq('is_operational', true);

      // Fetch today's tickets for revenue
      const today = new Date().toISOString().split('T')[0];
      const { data: ticketsData } = await supabase
        .from('tickets')
        .select('fare')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      const activeTrains = trainsData?.filter(t => t.status !== 'maintenance' && t.status !== 'cancelled') || [];
      const totalRevenue = ticketsData?.reduce((sum, ticket) => sum + parseFloat(ticket.fare), 0) || 0;

      setStats({
        totalTrains: trainsData?.length || 0,
        activeTrains: activeTrains.length,
        totalStations: stationsData?.length || 0,
        todayPassengers: ticketsData?.length || 0,
        todayRevenue: totalRevenue,
        operationalLines: linesData?.length || 0
      });

      setTrains(trainsData || []);

      // Create alerts based on train status
      const alerts = trainsData
        ?.filter(t => t.status === 'delayed' || t.status === 'maintenance')
        .map(t => ({
          id: t.id,
          type: t.status === 'delayed' ? 'warning' : 'maintenance',
          message: `Train ${t.train_number} is ${t.status}`,
          time: t.last_updated
        })) || [];

      setRecentAlerts(alerts);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      label: 'Active Trains',
      value: `${stats.activeTrains}/${stats.totalTrains}`,
      icon: <TrainIcon className="w-6 h-6" />,
      color: 'metro-blue-500',
      bgColor: 'bg-metro-blue-100'
    },
    {
      label: 'Total Stations',
      value: stats.totalStations,
      icon: <Activity className="w-6 h-6" />,
      color: 'metro-aqua-500',
      bgColor: 'bg-metro-aqua-100'
    },
    {
      label: 'Today\'s Passengers',
      value: stats.todayPassengers.toLocaleString(),
      icon: <Users className="w-6 h-6" />,
      color: 'metro-yellow-500',
      bgColor: 'bg-metro-yellow-100'
    },
    {
      label: 'Today\'s Revenue',
      value: `Rs. ${stats.todayRevenue.toFixed(0)}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'metro-blue-500',
      bgColor: 'bg-success-100'
    }
  ];

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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-lg text-neutral-700">
                  Metro Network Overview & Management
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-neutral-500" />
                <span className="text-neutral-700">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  <GlassCard variant="medium" className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center text-${stat.color}`}>
                        {stat.icon}
                      </div>
                      <TrendingUp className="w-5 h-5 text-success-500" />
                    </div>
                    <div className="text-3xl font-bold text-neutral-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-neutral-700">
                      {stat.label}
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Operational Lines Status */}
              <GlassCard variant="medium" className="p-6">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">
                  Metro Lines Status
                </h2>
                <div className="space-y-3">
                  {['blue', 'red', 'aqua', 'yellow'].map((line, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/20 rounded-lg">
                      <MetroLineBadge line={line as any} />
                      <StatusDot status="on-time" showLabel />
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Recent Alerts */}
              <GlassCard variant="medium" className="p-6">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">
                  Recent Alerts
                </h2>
                {recentAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-success-500 mx-auto mb-2" />
                    <p className="text-neutral-700">All systems operational</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentAlerts.slice(0, 5).map((alert, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-warning-100 border border-warning-500 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-warning-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-900">
                            {alert.message}
                          </p>
                          <p className="text-xs text-neutral-700 mt-1">
                            {new Date(alert.time).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Active Trains Overview */}
            <GlassCard variant="light" className="p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">
                Active Trains Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trains.slice(0, 6).map((train, idx) => (
                  <div key={idx} className="p-4 bg-white/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-neutral-900">
                        {train.train_number}
                      </span>
                      <StatusDot status={train.status} />
                    </div>
                    <div className="text-sm text-neutral-700">
                      Occupancy: {Math.round((train.current_occupancy / train.capacity) * 100)}%
                    </div>
                    <div className="mt-2 w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-metro-blue-500 transition-all"
                        style={{ width: `${(train.current_occupancy / train.capacity) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              <a href="/admin/trains" className="block">
                <GlassCard variant="subtle" className="p-4 hover:shadow-glass-hover transition-all cursor-pointer text-center">
                  <TrainIcon className="w-8 h-8 text-metro-blue-500 mx-auto mb-2" />
                  <div className="font-semibold text-neutral-900">Manage Trains</div>
                </GlassCard>
              </a>
              <a href="/admin/analytics" className="block">
                <GlassCard variant="subtle" className="p-4 hover:shadow-glass-hover transition-all cursor-pointer text-center">
                  <TrendingUp className="w-8 h-8 text-metro-aqua-500 mx-auto mb-2" />
                  <div className="font-semibold text-neutral-900">Analytics</div>
                </GlassCard>
              </a>
              <a href="/admin/qr-generator" className="block">
                <GlassCard variant="subtle" className="p-4 hover:shadow-glass-hover transition-all cursor-pointer text-center">
                  <Activity className="w-8 h-8 text-metro-yellow-500 mx-auto mb-2" />
                  <div className="font-semibold text-neutral-900">QR Generator</div>
                </GlassCard>
              </a>
              <button onClick={fetchDashboardData}>
                <GlassCard variant="subtle" className="p-4 hover:shadow-glass-hover transition-all cursor-pointer text-center">
                  <Activity className="w-8 h-8 text-success-500 mx-auto mb-2" />
                  <div className="font-semibold text-neutral-900">Refresh Data</div>
                </GlassCard>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

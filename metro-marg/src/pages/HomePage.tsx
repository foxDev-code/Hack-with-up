import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, GlassButton, MetroLineBadge, StatusDot } from '@/components/GlassComponents';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MapPin, 
  Ticket, 
  Radio, 
  QrCode, 
  Wallet, 
  TrendingUp,
  Clock,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Route Finder',
      description: 'Find the best metro route for your journey',
      link: '/route-finder',
      color: 'metro-blue-500'
    },
    {
      icon: <Radio className="w-6 h-6" />,
      title: 'Live Tracking',
      description: 'Track metro trains in real-time',
      link: '/live-tracking',
      color: 'metro-aqua-500'
    },
    {
      icon: <Ticket className="w-6 h-6" />,
      title: 'Book Ticket',
      description: 'Purchase tickets and passes instantly',
      link: '/book-ticket',
      color: 'metro-yellow-500'
    },
    {
      icon: <QrCode className="w-6 h-6" />,
      title: 'My Tickets',
      description: 'View and manage your tickets',
      link: '/my-tickets',
      color: 'metro-red-500'
    }
  ];

  const metroStats = [
    { label: 'Active Lines', value: '4', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Stations', value: '18', icon: <MapPin className="w-5 h-5" /> },
    { label: 'Daily Riders', value: '2.5M+', icon: <Users className="w-5 h-5" /> },
    { label: 'Avg. Wait Time', value: '3 min', icon: <Clock className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard 
              variant="light" 
              className="p-12 md:p-16 text-center"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
                Welcome to Metro <span className="text-metro-blue-500">मार्ग</span>
              </h1>
              <p className="text-xl md:text-2xl text-neutral-700 mb-8 max-w-3xl mx-auto">
                Your Smart Companion for Delhi-NCR Metro Travel. Plan routes, track trains, and book tickets seamlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <GlassButton 
                  variant="primary" 
                  size="lg"
                  onClick={() => navigate('/route-finder')}
                >
                  Find Your Route
                </GlassButton>
                {!user && (
                  <GlassButton 
                    variant="secondary" 
                    size="lg"
                    onClick={() => navigate('/signup')}
                  >
                    Create Account
                  </GlassButton>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Metro Lines Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8"
          >
            <GlassCard variant="medium" className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Metro Lines Status</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center justify-between">
                  <MetroLineBadge line="blue" />
                  <StatusDot status="on-time" showLabel />
                </div>
                <div className="flex items-center justify-between">
                  <MetroLineBadge line="red" />
                  <StatusDot status="on-time" showLabel />
                </div>
                <div className="flex items-center justify-between">
                  <MetroLineBadge line="aqua" />
                  <StatusDot status="on-time" showLabel />
                </div>
                <div className="flex items-center justify-between">
                  <MetroLineBadge line="yellow" />
                  <StatusDot status="delayed" showLabel />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-12 text-center">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <GlassCard
                  variant="light"
                  className="p-6 cursor-pointer hover:shadow-glass-hover transition-all duration-normal"
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(feature.link)}
                >
                  <div className={`w-12 h-12 rounded-lg bg-${feature.color} bg-opacity-10 flex items-center justify-center mb-4 text-${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-700">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Metro Statistics */}
      <section className="py-16 px-4 bg-gradient-hero">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-12 text-center">
            Delhi-NCR Metro Network
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {metroStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <GlassCard variant="medium" className="p-6 text-center">
                  <div className="flex justify-center mb-3 text-metro-blue-500">
                    {stat.icon}
                  </div>
                  <div className="text-4xl font-bold text-neutral-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-neutral-700">
                    {stat.label}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/30">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-neutral-700">
            Metro मार्ग - Smart Metro Travel Made Simple
          </p>
          <p className="text-neutral-500 text-sm mt-2">
            MiniMax Agent 2025. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { GlassCard, GlassButton, GlassInput, MetroLineBadge } from '@/components/GlassComponents';
import { supabase, Station, Route as RouteType } from '@/lib/supabase';
import { MapPin, ArrowRight, Clock, DollarSign, Navigation as NavIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export function RouteFinderPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStations();
  }, []);

  async function fetchStations() {
    try {
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setStations(data || []);
    } catch (err) {
      console.error('Error fetching stations:', err);
    }
  }

  async function calculateRoute() {
    if (!fromStation || !toStation) {
      setError('Please select both from and to stations');
      return;
    }

    if (fromStation === toStation) {
      setError('From and to stations cannot be the same');
      return;
    }

    setLoading(true);
    setError('');
    setRoute(null);

    try {
      // Call edge function to calculate route
      const { data, error } = await supabase.functions.invoke('calculate-route', {
        body: {
          fromStationId: fromStation,
          toStationId: toStation
        }
      });

      if (error) throw error;

      // Fetch full station details
      const [fromStationData, toStationData] = await Promise.all([
        supabase.from('stations').select('*').eq('id', fromStation).maybeSingle(),
        supabase.from('stations').select('*').eq('id', toStation).maybeSingle()
      ]);

      setRoute({
        ...data.data,
        from_station: fromStationData.data,
        to_station: toStationData.data
      });
    } catch (err: any) {
      console.error('Route calculation error:', err);
      setError(err.message || 'Failed to calculate route');
    } finally {
      setLoading(false);
    }
  }

  function getMetroLineColor(stationId: string): 'blue' | 'red' | 'aqua' | 'yellow' {
    const station = stations.find(s => s.id === stationId);
    if (!station) return 'blue';
    
    // Simple mapping based on station code prefix
    if (station.code.startsWith('BL')) return 'blue';
    if (station.code.startsWith('RL')) return 'red';
    if (station.code.startsWith('AL')) return 'aqua';
    if (station.code.startsWith('YL')) return 'yellow';
    return 'blue';
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4 text-center">
              Route Finder
            </h1>
            <p className="text-lg text-neutral-700 mb-12 text-center">
              Find the best route for your metro journey
            </p>

            {/* Route Search */}
            <GlassCard variant="medium" className="p-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    From Station
                  </label>
                  <select
                    value={fromStation}
                    onChange={(e) => setFromStation(e.target.value)}
                    className="w-full h-14 px-4 bg-white/25 backdrop-blur-[10px] border border-white/30 rounded-md text-neutral-900 focus:outline-none focus:ring-2 focus:ring-metro-blue-500/40"
                  >
                    <option value="">Select starting station</option>
                    {stations.map(station => (
                      <option key={station.id} value={station.id}>
                        {station.name} ({station.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    To Station
                  </label>
                  <select
                    value={toStation}
                    onChange={(e) => setToStation(e.target.value)}
                    className="w-full h-14 px-4 bg-white/25 backdrop-blur-[10px] border border-white/30 rounded-md text-neutral-900 focus:outline-none focus:ring-2 focus:ring-metro-blue-500/40"
                  >
                    <option value="">Select destination station</option>
                    {stations.map(station => (
                      <option key={station.id} value={station.id}>
                        {station.name} ({station.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-error-100 border border-error-500 rounded-md text-error-500">
                  {error}
                </div>
              )}

              <GlassButton
                variant="primary"
                size="lg"
                onClick={calculateRoute}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Calculating...' : 'Find Route'}
              </GlassButton>
            </GlassCard>

            {/* Route Results */}
            {route && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <GlassCard variant="light" className="p-8">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                    Route Details
                  </h2>

                  {/* Journey Path */}
                  <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin className="w-5 h-5 text-metro-blue-500" />
                        <span className="text-lg font-semibold text-neutral-900">
                          {route.from_station?.name}
                        </span>
                      </div>
                      <MetroLineBadge line={getMetroLineColor(route.from_station_id)} />
                    </div>

                    <ArrowRight className="w-8 h-8 text-neutral-500" />

                    <div className="flex-1 text-right">
                      <div className="flex items-center justify-end gap-3 mb-2">
                        <span className="text-lg font-semibold text-neutral-900">
                          {route.to_station?.name}
                        </span>
                        <MapPin className="w-5 h-5 text-metro-blue-500" />
                      </div>
                      <div className="flex justify-end">
                        <MetroLineBadge line={getMetroLineColor(route.to_station_id)} />
                      </div>
                    </div>
                  </div>

                  {/* Route Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <GlassCard variant="subtle" className="p-4">
                      <div className="flex items-center gap-3">
                        <NavIcon className="w-5 h-5 text-metro-blue-500" />
                        <div>
                          <div className="text-sm text-neutral-700">Distance</div>
                          <div className="text-xl font-bold text-neutral-900">
                            {route.distance_km} km
                          </div>
                        </div>
                      </div>
                    </GlassCard>

                    <GlassCard variant="subtle" className="p-4">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-metro-aqua-500" />
                        <div>
                          <div className="text-sm text-neutral-700">Duration</div>
                          <div className="text-xl font-bold text-neutral-900">
                            {route.travel_time_minutes} min
                          </div>
                        </div>
                      </div>
                    </GlassCard>

                    <GlassCard variant="subtle" className="p-4">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-metro-yellow-500" />
                        <div>
                          <div className="text-sm text-neutral-700">Fare</div>
                          <div className="text-xl font-bold text-neutral-900">
                            Rs. {route.base_fare}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </div>

                  {/* Book Ticket Button */}
                  <GlassButton
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => window.location.href = '/book-ticket'}
                  >
                    Book Ticket for This Route
                  </GlassButton>
                </GlassCard>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

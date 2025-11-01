import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { GlassCard, MetroLineBadge, StatusDot } from '@/components/GlassComponents';
import { supabase, Train, Station } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Train as TrainIcon, MapPin, Navigation as NavigationIcon, Shuffle, ArrowRight } from 'lucide-react';

export function LiveTrackingPage() {
  const [selectedLine, setSelectedLine] = useState<string>('BL');
  const [trains, setTrains] = useState<Train[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);

  const lines = [
    { code: 'BL', name: 'Blue Line', color: 'blue' as const },
    { code: 'RL', name: 'Red Line', color: 'red' as const },
    { code: 'AL', name: 'Aqua Line', color: 'aqua' as const },
    { code: 'YL', name: 'Yellow Line', color: 'yellow' as const },
  ];

  useEffect(() => {
    fetchTrainsAndStations();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchTrainsAndStations, 10000);
    return () => clearInterval(interval);
  }, [selectedLine]);

  async function fetchTrainsAndStations() {
    setLoading(true);
    try {
      // Get metro line
      const { data: lineData } = await supabase
        .from('metro_lines')
        .select('id')
        .eq('code', selectedLine)
        .maybeSingle();

      if (!lineData) return;

      // Fetch trains for selected line
      const { data: trainsData } = await supabase
        .from('trains')
        .select('*')
        .eq('metro_line_id', lineData.id);

      // Fetch stations for selected line
      const { data: stationsData } = await supabase
        .from('stations')
        .select('*')
        .eq('metro_line_id', lineData.id)
        .order('code');

      setTrains(trainsData || []);
      setStations(stationsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStationName(stationId: string | null) {
    if (!stationId) return 'Unknown';
    const station = stations.find(s => s.id === stationId);
    return station?.name || 'Unknown';
  }

  function getOccupancyPercentage(train: Train) {
    return Math.round((train.current_occupancy / train.capacity) * 100);
  }

  function getOccupancyColor(percentage: number) {
    if (percentage < 50) return 'bg-success-500';
    if (percentage < 80) return 'bg-warning-500';
    return 'bg-error-500';
  }

  function getUpcomingStations(currentStationId: string | null) {
    if (!currentStationId) return [];
    
    const currentIndex = stations.findIndex(s => s.id === currentStationId);
    if (currentIndex === -1) return [];
    
    // Return next 3 stations
    return stations.slice(currentIndex + 1, currentIndex + 4);
  }

  // Function to check if a station is an interchange station
  function isInterchangeStation(stationId: string) {
    // Common interchange stations in Delhi Metro (simplified for demo)
    const interchangeStations = [
      'Rajiv Chowk', 'Central Secretariat', 'Kashmere Gate', 
      'New Delhi', 'Botanical Garden', 'Noida City Centre'
    ];
    
    const station = stations.find(s => s.id === stationId);
    return station ? interchangeStations.includes(station.name) : false;
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
              Live Metro Tracking
            </h1>
            <p className="text-lg text-neutral-700 mb-12 text-center">
              Real-time train positions and arrival times
            </p>

            {/* Line Selector */}
            <GlassCard variant="medium" className="p-4 mb-8">
              <div className="flex gap-3 overflow-x-auto">
                {lines.map((line) => (
                  <button
                    key={line.code}
                    onClick={() => setSelectedLine(line.code)}
                    className={`flex-shrink-0 ${
                      selectedLine === line.code ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                    } transition-opacity`}
                  >
                    <MetroLineBadge line={line.color} />
                  </button>
                ))}
              </div>
            </GlassCard>

            {/* Trains List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="text-neutral-700">Loading trains...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {trains.length === 0 ? (
                  <GlassCard variant="light" className="p-8 text-center">
                    <p className="text-neutral-700">No trains currently running on this line</p>
                  </GlassCard>
                ) : (
                  trains.map((train) => {
                    const occupancyPercentage = getOccupancyPercentage(train);
                    const upcomingStations = getUpcomingStations(train.current_station_id);
                    const currentIndex = train.current_station_id 
                      ? stations.findIndex(s => s.id === train.current_station_id) 
                      : -1;
                    
                    return (
                      <motion.div
                        key={train.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <GlassCard variant="light" className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-metro-blue-500 bg-opacity-10 flex items-center justify-center">
                                <TrainIcon className="w-6 h-6 text-metro-blue-500" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-neutral-900">
                                  {train.train_number}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <MapPin className="w-4 h-4 text-neutral-500" />
                                  <span className="text-sm text-neutral-700">
                                    {getStationName(train.current_station_id)}
                                  </span>
                                  {/* Blinking light for current station */}
                                  <div className="w-2 h-2 rounded-full bg-metro-blue-500 animate-pulse"></div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                              <StatusDot status={train.status} showLabel />
                              
                              {train.eta_minutes && (
                                <div className="text-sm text-neutral-700">
                                  Next station: <span className="font-semibold">{train.eta_minutes} min</span>
                                </div>
                              )}

                              <div className="flex items-center gap-2">
                                <div className="text-sm text-neutral-700">Occupancy:</div>
                                <div className="w-24 h-2 bg-neutral-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${getOccupancyColor(occupancyPercentage)} transition-all duration-500`}
                                    style={{ width: `${occupancyPercentage}%` }}
                                  />
                                </div>
                                <div className="text-sm font-semibold text-neutral-900">
                                  {occupancyPercentage}%
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Upcoming Stations with Blinking Lights and Interchange Information */}
                          {upcomingStations.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/20">
                              <div className="flex items-center gap-2 mb-3">
                                <NavigationIcon className="w-4 h-4 text-metro-aqua-500" />
                                <span className="text-sm font-semibold text-neutral-900">Upcoming Stations:</span>
                              </div>
                              <div className="relative pl-6">
                                {/* Route line */}
                                <div className="absolute left-2 top-3 bottom-3 w-0.5 bg-metro-blue-300"></div>
                                
                                {/* Stations with blinking lights and interchange information */}
                                <div className="space-y-3">
                                  {upcomingStations.map((station, index) => (
                                    <div key={station.id} className="relative flex flex-col">
                                      {/* Blinking light for upcoming station */}
                                      <div className="absolute left-[-6px] top-4 w-3 h-3 rounded-full bg-metro-aqua-500 animate-pulse"></div>
                                      
                                      <div className="ml-4 flex items-center gap-2">
                                        <span className="text-sm text-neutral-900 font-medium">
                                          {station.name}
                                        </span>
                                        {index === 0 && (
                                          <span className="text-xs px-2 py-1 bg-metro-yellow-100 text-metro-yellow-700 rounded">
                                            Next
                                          </span>
                                        )}
                                        {/* Interchange indicator */}
                                        {isInterchangeStation(station.id) && (
                                          <span className="text-xs px-2 py-1 bg-metro-aqua-100 text-metro-aqua-700 rounded flex items-center gap-1">
                                            <Shuffle className="w-3 h-3" />
                                            Interchange
                                          </span>
                                        )}
                                      </div>
                                      
                                      {/* Interchange details */}
                                      {isInterchangeStation(station.id) && (
                                        <div className="ml-4 mt-1 text-xs text-neutral-600 flex items-center gap-1">
                                          <ArrowRight className="w-3 h-3" />
                                          Connects to Red, Yellow Lines
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </GlassCard>
                      </motion.div>
                    );
                  })
                )}
              </div>
            )}

            {/* Stations List with Interchange Information */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                Stations on {lines.find(l => l.code === selectedLine)?.name}
              </h2>
              <GlassCard variant="medium" className="p-6">
                <div className="space-y-3">
                  {stations.map((station, index) => (
                    <div
                      key={station.id}
                      className="flex items-center justify-between py-3 border-b border-white/20 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-metro-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900 flex items-center gap-2">
                            {station.name}
                            {isInterchangeStation(station.id) && (
                              <span className="text-xs px-2 py-1 bg-metro-aqua-100 text-metro-aqua-700 rounded flex items-center gap-1">
                                <Shuffle className="w-3 h-3" />
                                Interchange
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-neutral-700">{station.code}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {station.has_wifi && (
                          <span className="px-2 py-1 bg-metro-blue-100 text-metro-blue-700 rounded text-xs">WiFi</span>
                        )}
                        {station.has_parking && (
                          <span className="px-2 py-1 bg-metro-aqua-100 text-metro-aqua-700 rounded text-xs">Parking</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
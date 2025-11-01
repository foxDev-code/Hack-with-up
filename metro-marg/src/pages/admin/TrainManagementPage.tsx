import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { GlassCard, GlassButton, MetroLineBadge, StatusDot } from '@/components/GlassComponents';
import { supabase, Train } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Train as TrainIcon, Edit, X, Plus } from 'lucide-react';

export function TrainManagementPage() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    status: 'on-time' as Train['status'],
    eta_minutes: 0,
    current_occupancy: 0
  });

  useEffect(() => {
    fetchTrains();
  }, []);

  async function fetchTrains() {
    try {
      const { data } = await supabase
        .from('trains')
        .select('*')
        .order('train_number');
      
      setTrains(data || []);
    } catch (error) {
      console.error('Error fetching trains:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateTrain() {
    if (!selectedTrain) return;

    try {
      const { error } = await supabase
        .from('trains')
        .update({
          status: formData.status,
          eta_minutes: formData.eta_minutes,
          current_occupancy: formData.current_occupancy,
          last_updated: new Date().toISOString()
        })
        .eq('id', selectedTrain.id);

      if (error) throw error;

      await fetchTrains();
      setEditMode(false);
      setSelectedTrain(null);
      alert('Train updated successfully!');
    } catch (error: any) {
      console.error('Error updating train:', error);
      alert('Failed to update train: ' + error.message);
    }
  }

  function openEditModal(train: Train) {
    setSelectedTrain(train);
    setFormData({
      status: train.status,
      eta_minutes: train.eta_minutes || 0,
      current_occupancy: train.current_occupancy
    });
    setEditMode(true);
  }

  function getLineColor(trainNumber: string): 'blue' | 'red' | 'aqua' | 'yellow' {
    if (trainNumber.startsWith('BL')) return 'blue';
    if (trainNumber.startsWith('RL')) return 'red';
    if (trainNumber.startsWith('AL')) return 'aqua';
    if (trainNumber.startsWith('YL')) return 'yellow';
    return 'blue';
  }

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
                  Train Management
                </h1>
                <p className="text-lg text-neutral-700">
                  Manage train schedules and status
                </p>
              </div>
              <GlassButton variant="primary" onClick={fetchTrains}>
                Refresh Data
              </GlassButton>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="text-neutral-700">Loading trains...</div>
              </div>
            ) : (
              <GlassCard variant="medium" className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/30">
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Train</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Line</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">ETA</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Occupancy</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Last Updated</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trains.map((train) => (
                        <tr key={train.id} className="border-b border-white/20 hover:bg-white/10">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <TrainIcon className="w-5 h-5 text-metro-blue-500" />
                              <span className="font-semibold text-neutral-900">
                                {train.train_number}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <MetroLineBadge line={getLineColor(train.train_number)} />
                          </td>
                          <td className="py-3 px-4">
                            <StatusDot status={train.status} showLabel />
                          </td>
                          <td className="py-3 px-4 text-neutral-900">
                            {train.eta_minutes ? `${train.eta_minutes} min` : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-neutral-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-metro-blue-500"
                                  style={{ width: `${(train.current_occupancy / train.capacity) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm text-neutral-700">
                                {Math.round((train.current_occupancy / train.capacity) * 100)}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-neutral-700">
                            {new Date(train.last_updated).toLocaleTimeString()}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => openEditModal(train)}
                              className="p-2 hover:bg-white/20 rounded-md transition-colors"
                            >
                              <Edit className="w-5 h-5 text-metro-blue-500" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}
          </motion.div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editMode && selectedTrain && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setEditMode(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <GlassCard variant="medium" className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-neutral-900">
                    Edit {selectedTrain.train_number}
                  </h3>
                  <button
                    onClick={() => setEditMode(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-neutral-700" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Train['status'] })}
                      className="w-full h-14 px-4 bg-white/25 backdrop-blur-[10px] border border-white/30 rounded-md text-neutral-900 focus:outline-none focus:ring-2 focus:ring-metro-blue-500/40"
                    >
                      <option value="on-time">On Time</option>
                      <option value="delayed">Delayed</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">
                      ETA (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.eta_minutes}
                      onChange={(e) => setFormData({ ...formData, eta_minutes: parseInt(e.target.value) })}
                      className="w-full h-14 px-4 bg-white/25 backdrop-blur-[10px] border border-white/30 rounded-md text-neutral-900 focus:outline-none focus:ring-2 focus:ring-metro-blue-500/40"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">
                      Current Occupancy
                    </label>
                    <input
                      type="number"
                      value={formData.current_occupancy}
                      onChange={(e) => setFormData({ ...formData, current_occupancy: parseInt(e.target.value) })}
                      className="w-full h-14 px-4 bg-white/25 backdrop-blur-[10px] border border-white/30 rounded-md text-neutral-900 focus:outline-none focus:ring-2 focus:ring-metro-blue-500/40"
                      min="0"
                      max={selectedTrain.capacity}
                    />
                    <p className="text-sm text-neutral-700 mt-1">
                      Capacity: {selectedTrain.capacity}
                    </p>
                  </div>

                  <div className="pt-4">
                    <GlassButton
                      variant="primary"
                      size="lg"
                      onClick={updateTrain}
                      className="w-full"
                    >
                      Update Train
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

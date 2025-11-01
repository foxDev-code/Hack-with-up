import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { GlassCard } from '@/components/GlassComponents';
import { supabase, Ticket } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket as TicketIcon, X, Download } from 'lucide-react';

export function MyTicketsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/my-tickets');
      return;
    }
    fetchTickets();
  }, [user, navigate]);

  async function fetchTickets() {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch station details for each ticket
      const ticketsWithStations = await Promise.all(
        (data || []).map(async (ticket) => {
          const [fromStation, toStation] = await Promise.all([
            supabase.from('stations').select('*').eq('id', ticket.from_station_id).maybeSingle(),
            supabase.from('stations').select('*').eq('id', ticket.to_station_id).maybeSingle()
          ]);
          return {
            ...ticket,
            from_station: fromStation.data,
            to_station: toStation.data
          };
        })
      );

      setTickets(ticketsWithStations);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }

  function getTicketStatus(ticket: any) {
    const createdAt = new Date(ticket.created_at);
    const expiryTime = new Date(createdAt.getTime() + ticket.validity_hours * 60 * 60 * 1000);
    const now = new Date();
    
    if (!ticket.is_active) return 'used';
    if (now > expiryTime) return 'expired';
    return 'active';
  }

  if (!user) {
    return null;
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
              My Tickets
            </h1>
            <p className="text-lg text-neutral-700 mb-12 text-center">
              View and manage your metro tickets
            </p>

            {loading ? (
              <div className="text-center py-12">
                <div className="text-neutral-700">Loading tickets...</div>
              </div>
            ) : tickets.length === 0 ? (
              <GlassCard variant="light" className="p-12 text-center">
                <TicketIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  No Tickets Yet
                </h3>
                <p className="text-neutral-700 mb-6">
                  You haven't booked any tickets yet. Book your first ticket now!
                </p>
                <button
                  onClick={() => navigate('/book-ticket')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-metro-blue-500 text-white rounded-lg hover:bg-metro-blue-700 transition-colors"
                >
                  Book Ticket
                </button>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tickets.map((ticket) => {
                  const status = getTicketStatus(ticket);
                  const statusColors = {
                    active: 'bg-success-100 text-success-500 border-success-500',
                    expired: 'bg-neutral-100 text-neutral-500 border-neutral-500',
                    used: 'bg-neutral-100 text-neutral-500 border-neutral-500'
                  };

                  return (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <GlassCard
                        variant="light"
                        className="p-6 cursor-pointer hover:shadow-glass-hover transition-all"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[status as keyof typeof statusColors]}`}>
                            {status.toUpperCase()}
                          </span>
                          <TicketIcon className="w-5 h-5 text-metro-blue-500" />
                        </div>

                        <div className="mb-4">
                          <div className="text-sm text-neutral-700 mb-1">From</div>
                          <div className="font-semibold text-neutral-900">
                            {ticket.from_station?.name || 'Unknown'}
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="text-sm text-neutral-700 mb-1">To</div>
                          <div className="font-semibold text-neutral-900">
                            {ticket.to_station?.name || 'Unknown'}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-white/30">
                          <div>
                            <div className="text-sm text-neutral-700">Fare</div>
                            <div className="font-bold text-metro-blue-500">
                              Rs. {ticket.fare}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-neutral-700">Type</div>
                            <div className="font-medium text-neutral-900 text-sm">
                              {ticket.ticket_type.replace('_', ' ')}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicket(ticket);
                          }}
                          className="w-full mt-4 py-2 bg-metro-blue-500 text-white rounded-md hover:bg-metro-blue-700 transition-colors"
                        >
                          View QR Code
                        </button>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedTicket(null)}
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
                  <h3 className="text-2xl font-bold text-neutral-900">Ticket QR Code</h3>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-neutral-700" />
                  </button>
                </div>

                <div className="bg-white p-6 rounded-lg mb-6">
                  <QRCodeSVG
                    value={selectedTicket.qr_code}
                    size={256}
                    level="H"
                    className="mx-auto"
                  />
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-neutral-700">From:</span>
                    <span className="font-semibold text-neutral-900">
                      {selectedTicket.from_station?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-700">To:</span>
                    <span className="font-semibold text-neutral-900">
                      {selectedTicket.to_station?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-700">Fare:</span>
                    <span className="font-semibold text-metro-blue-500">
                      Rs. {selectedTicket.fare}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-700">Valid for:</span>
                    <span className="font-semibold text-neutral-900">
                      {selectedTicket.validity_hours} hours
                    </span>
                  </div>
                </div>

                <div className="text-center text-sm text-neutral-700">
                  Show this QR code at metro gates
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

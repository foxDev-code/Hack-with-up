import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { GlassCard, GlassButton } from '@/components/GlassComponents';
import { supabase, Station } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Ticket, Users, CreditCard, Wallet, Building2, Smartphone, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

type PassengerCounts = {
  adult: number;
  senior: number;
  child: number;
};

type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet';

type BookingData = {
  fromStation: string;
  toStation: string;
  passengers: PassengerCounts;
  paymentMethod: PaymentMethod | null;
  baseFare: number;
  totalFare: number;
  ticketId?: string;
  qrData?: string;
};

const PASSENGER_PRICES = {
  adult: 30,
  senior: 15,
  child: 10,
};

export function BookTicketPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [bookingData, setBookingData] = useState<BookingData>({
    fromStation: '',
    toStation: '',
    passengers: { adult: 1, senior: 0, child: 0 },
    paymentMethod: null,
    baseFare: 30,
    totalFare: 30,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/book-ticket');
      return;
    }
    fetchStations();
  }, [user, navigate]);

  async function fetchStations() {
    const { data } = await supabase.from('stations').select('*').order('name');
    setStations(data || []);
  }

  const calculateTotalFare = (passengers: PassengerCounts) => {
    return (
      passengers.adult * PASSENGER_PRICES.adult +
      passengers.senior * PASSENGER_PRICES.senior +
      passengers.child * PASSENGER_PRICES.child
    );
  };

  const updatePassengerCount = (type: keyof PassengerCounts, delta: number) => {
    const newCount = Math.max(0, bookingData.passengers[type] + delta);
    // Ensure at least one passenger
    const totalPassengers = Object.values({
      ...bookingData.passengers,
      [type]: newCount,
    }).reduce((sum, count) => sum + count, 0);

    if (totalPassengers === 0) return;

    const updatedPassengers = { ...bookingData.passengers, [type]: newCount };
    const totalFare = calculateTotalFare(updatedPassengers);

    setBookingData({
      ...bookingData,
      passengers: updatedPassengers,
      totalFare,
    });
  };

  const handleRouteSubmit = async () => {
    if (!bookingData.fromStation || !bookingData.toStation) {
      setError('Please select both stations');
      return;
    }
    if (bookingData.fromStation === bookingData.toStation) {
      setError('From and to stations cannot be the same');
      return;
    }
    setError('');
    setCurrentStep(2);
  };

  const handleFareConfirm = () => {
    setCurrentStep(3);
  };

  const handlePassengerConfirm = () => {
    setCurrentStep(4);
  };

  const handlePaymentSubmit = async () => {
    if (!bookingData.paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Book ticket via edge function
      const totalPassengers = Object.values(bookingData.passengers).reduce(
        (sum, count) => sum + count,
        0
      );

      const { data, error } = await supabase.functions.invoke('book-ticket', {
        body: {
          fromStationId: bookingData.fromStation,
          toStationId: bookingData.toStation,
          ticketType: 'single_journey',
          journeyDate: new Date().toISOString().split('T')[0],
          fare: bookingData.totalFare,
          passengers: totalPassengers,
        },
      });

      if (error) throw error;

      // Generate QR data
      const ticketId = data?.data?.ticketId || `TKT${Date.now()}`;
      const fromStationName = stations.find(s => s.id === bookingData.fromStation)?.name || '';
      const toStationName = stations.find(s => s.id === bookingData.toStation)?.name || '';
      
      const qrData = JSON.stringify({
        ticketId,
        from: fromStationName,
        to: toStationName,
        passengers: bookingData.passengers,
        fare: bookingData.totalFare,
        date: new Date().toLocaleDateString(),
      });

      setBookingData({
        ...bookingData,
        ticketId,
        qrData,
      });

      setCurrentStep(5);
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || 'Failed to book ticket');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  if (!user) {
    return null;
  }

  const fromStationName = stations.find(s => s.id === bookingData.fromStation)?.name || '';
  const toStationName = stations.find(s => s.id === bookingData.toStation)?.name || '';

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navigation />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header with Back Button */}
          {currentStep > 1 && currentStep < 5 && (
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-neutral-900 hover:text-metro-blue-500 mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
          )}

          <AnimatePresence mode="wait">
            {/* Step 1: Route Selection */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4 text-center">
                  Book Ticket
                </h1>
                <p className="text-lg text-neutral-700 mb-12 text-center">
                  Select your journey route
                </p>

                <GlassCard variant="medium" className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-900 mb-2">
                        From Station
                      </label>
                      <select
                        value={bookingData.fromStation}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, fromStation: e.target.value })
                        }
                        className="w-full h-14 px-4 bg-white/25 backdrop-blur-[10px] border border-white/30 rounded-md text-neutral-900 focus:outline-none focus:ring-2 focus:ring-metro-blue-500/40"
                      >
                        <option value="">Select starting station</option>
                        {stations.map((station) => (
                          <option key={station.id} value={station.id}>
                            {station.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-900 mb-2">
                        To Station
                      </label>
                      <select
                        value={bookingData.toStation}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, toStation: e.target.value })
                        }
                        className="w-full h-14 px-4 bg-white/25 backdrop-blur-[10px] border border-white/30 rounded-md text-neutral-900 focus:outline-none focus:ring-2 focus:ring-metro-blue-500/40"
                      >
                        <option value="">Select destination</option>
                        {stations.map((station) => (
                          <option key={station.id} value={station.id}>
                            {station.name}
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
                    onClick={handleRouteSubmit}
                    className="w-full"
                  >
                    Continue
                  </GlassButton>
                </GlassCard>
              </motion.div>
            )}

            {/* Step 2: Fare Calculator */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4 text-center">
                  Fare Calculator
                </h1>
                <p className="text-lg text-neutral-700 mb-12 text-center">
                  Review your journey details
                </p>

                <GlassCard variant="medium" className="p-8">
                  <div className="space-y-6 mb-8">
                    {/* Route Info */}
                    <div className="p-6 bg-white/20 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-sm text-neutral-600 mb-1">From</div>
                          <div className="text-lg font-semibold text-neutral-900">
                            {fromStationName}
                          </div>
                        </div>
                        <div className="text-metro-blue-500">→</div>
                        <div className="text-right">
                          <div className="text-sm text-neutral-600 mb-1">To</div>
                          <div className="text-lg font-semibold text-neutral-900">
                            {toStationName}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Fare Breakdown */}
                    <div className="p-6 bg-white/20 rounded-lg">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                        Fare Breakdown (Base)
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-neutral-700">Adult (per person)</span>
                          <span className="font-semibold text-neutral-900">₹30</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-700">Senior (per person)</span>
                          <span className="font-semibold text-neutral-900">₹15</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-700">Child (per person)</span>
                          <span className="font-semibold text-neutral-900">₹10</span>
                        </div>
                        <div className="pt-3 border-t border-white/30 flex justify-between">
                          <span className="font-semibold text-neutral-900">Total (1 Adult)</span>
                          <span className="font-bold text-metro-blue-500 text-xl">₹55</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <GlassButton
                    variant="primary"
                    size="lg"
                    onClick={handleFareConfirm}
                    className="w-full"
                  >
                    Continue to Passengers
                  </GlassButton>
                </GlassCard>
              </motion.div>
            )}

            {/* Step 3: Choose Passengers */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4 text-center">
                  Choose Passengers
                </h1>
                <p className="text-lg text-neutral-700 mb-12 text-center">
                  Select passenger types and quantities
                </p>

                <GlassCard variant="medium" className="p-8">
                  {/* Passenger Types */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-6">
                      Passenger Types
                    </h3>
                    <div className="space-y-4">
                      {/* Adult */}
                      <div className="flex items-center justify-between p-4 bg-white/20 rounded-lg">
                        <div className="flex-1">
                          <div className="font-semibold text-neutral-900">Adult</div>
                          <div className="text-sm text-neutral-600">₹30 per person</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => updatePassengerCount('adult', -1)}
                            className="w-10 h-10 flex items-center justify-center bg-white/30 hover:bg-white/40 rounded-md transition-colors"
                          >
                            <Minus className="w-5 h-5 text-neutral-900" />
                          </button>
                          <span className="text-xl font-bold text-neutral-900 w-8 text-center">
                            {bookingData.passengers.adult}
                          </span>
                          <button
                            onClick={() => updatePassengerCount('adult', 1)}
                            className="w-10 h-10 flex items-center justify-center bg-white/30 hover:bg-white/40 rounded-md transition-colors"
                          >
                            <Plus className="w-5 h-5 text-neutral-900" />
                          </button>
                        </div>
                      </div>

                      {/* Senior */}
                      <div className="flex items-center justify-between p-4 bg-white/20 rounded-lg">
                        <div className="flex-1">
                          <div className="font-semibold text-neutral-900">Senior</div>
                          <div className="text-sm text-neutral-600">₹15 per person</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => updatePassengerCount('senior', -1)}
                            className="w-10 h-10 flex items-center justify-center bg-white/30 hover:bg-white/40 rounded-md transition-colors"
                          >
                            <Minus className="w-5 h-5 text-neutral-900" />
                          </button>
                          <span className="text-xl font-bold text-neutral-900 w-8 text-center">
                            {bookingData.passengers.senior}
                          </span>
                          <button
                            onClick={() => updatePassengerCount('senior', 1)}
                            className="w-10 h-10 flex items-center justify-center bg-white/30 hover:bg-white/40 rounded-md transition-colors"
                          >
                            <Plus className="w-5 h-5 text-neutral-900" />
                          </button>
                        </div>
                      </div>

                      {/* Child */}
                      <div className="flex items-center justify-between p-4 bg-white/20 rounded-lg">
                        <div className="flex-1">
                          <div className="font-semibold text-neutral-900">Child</div>
                          <div className="text-sm text-neutral-600">₹10 per person</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => updatePassengerCount('child', -1)}
                            className="w-10 h-10 flex items-center justify-center bg-white/30 hover:bg-white/40 rounded-md transition-colors"
                          >
                            <Minus className="w-5 h-5 text-neutral-900" />
                          </button>
                          <span className="text-xl font-bold text-neutral-900 w-8 text-center">
                            {bookingData.passengers.child}
                          </span>
                          <button
                            onClick={() => updatePassengerCount('child', 1)}
                            className="w-10 h-10 flex items-center justify-center bg-white/30 hover:bg-white/40 rounded-md transition-colors"
                          >
                            <Plus className="w-5 h-5 text-neutral-900" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Fare */}
                  <div className="mb-8 p-6 bg-metro-blue-50 border-2 border-metro-blue-500 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-neutral-900">Total Fare</span>
                      <span className="text-3xl font-bold text-metro-blue-500">
                        ₹{bookingData.totalFare}
                      </span>
                    </div>
                  </div>

                  <GlassButton
                    variant="primary"
                    size="lg"
                    onClick={handlePassengerConfirm}
                    className="w-full"
                  >
                    Proceed to Payment
                  </GlassButton>
                </GlassCard>
              </motion.div>
            )}

            {/* Step 4: Payment */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4 text-center">
                  Payment
                </h1>
                <p className="text-lg text-neutral-700 mb-12 text-center">
                  Choose your payment method
                </p>

                <GlassCard variant="medium" className="p-8">
                  {/* Payment Methods */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-6">
                      Payment Methods
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Credit/Debit Card */}
                      <button
                        onClick={() =>
                          setBookingData({ ...bookingData, paymentMethod: 'card' })
                        }
                        className={`p-4 rounded-lg border-2 transition-all ${
                          bookingData.paymentMethod === 'card'
                            ? 'border-metro-blue-500 bg-metro-blue-50'
                            : 'border-white/30 bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        <CreditCard className="w-8 h-8 text-metro-blue-500 mb-3 mx-auto" />
                        <div className="font-semibold text-neutral-900 text-center">
                          Credit/Debit Card
                        </div>
                      </button>

                      {/* UPI */}
                      <button
                        onClick={() =>
                          setBookingData({ ...bookingData, paymentMethod: 'upi' })
                        }
                        className={`p-4 rounded-lg border-2 transition-all ${
                          bookingData.paymentMethod === 'upi'
                            ? 'border-metro-blue-500 bg-metro-blue-50'
                            : 'border-white/30 bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        <Smartphone className="w-8 h-8 text-metro-blue-500 mb-3 mx-auto" />
                        <div className="font-semibold text-neutral-900 text-center">UPI</div>
                      </button>

                      {/* Net Banking */}
                      <button
                        onClick={() =>
                          setBookingData({ ...bookingData, paymentMethod: 'netbanking' })
                        }
                        className={`p-4 rounded-lg border-2 transition-all ${
                          bookingData.paymentMethod === 'netbanking'
                            ? 'border-metro-blue-500 bg-metro-blue-50'
                            : 'border-white/30 bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        <Building2 className="w-8 h-8 text-metro-blue-500 mb-3 mx-auto" />
                        <div className="font-semibold text-neutral-900 text-center">
                          Net Banking
                        </div>
                      </button>

                      {/* Wallet */}
                      <button
                        onClick={() =>
                          setBookingData({ ...bookingData, paymentMethod: 'wallet' })
                        }
                        className={`p-4 rounded-lg border-2 transition-all ${
                          bookingData.paymentMethod === 'wallet'
                            ? 'border-metro-blue-500 bg-metro-blue-50'
                            : 'border-white/30 bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        <Wallet className="w-8 h-8 text-metro-blue-500 mb-3 mx-auto" />
                        <div className="font-semibold text-neutral-900 text-center">
                          Wallet
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="mb-8 p-6 bg-white/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-neutral-900">Total Amount</span>
                      <span className="text-3xl font-bold text-metro-blue-500">
                        ₹{bookingData.totalFare}
                      </span>
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
                    onClick={handlePaymentSubmit}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Processing...' : 'Pay Now'}
                  </GlassButton>
                </GlassCard>
              </motion.div>
            )}

            {/* Step 5: QR Ticket */}
            {currentStep === 5 && bookingData.qrData && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4 text-center">
                  Your Ticket
                </h1>
                <p className="text-lg text-neutral-700 mb-12 text-center">
                  Show this QR code at the metro gate
                </p>

                <GlassCard variant="medium" className="p-8">
                  {/* QR Code */}
                  <div className="flex justify-center mb-8">
                    <div className="p-6 bg-white rounded-lg shadow-lg">
                      <QRCodeSVG value={bookingData.qrData} size={240} level="H" />
                    </div>
                  </div>

                  {/* Ticket Details */}
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between p-4 bg-white/20 rounded-lg">
                      <span className="text-neutral-700">Ticket ID</span>
                      <span className="font-semibold text-neutral-900">
                        {bookingData.ticketId}
                      </span>
                    </div>
                    <div className="flex justify-between p-4 bg-white/20 rounded-lg">
                      <span className="text-neutral-700">From</span>
                      <span className="font-semibold text-neutral-900">{fromStationName}</span>
                    </div>
                    <div className="flex justify-between p-4 bg-white/20 rounded-lg">
                      <span className="text-neutral-700">To</span>
                      <span className="font-semibold text-neutral-900">{toStationName}</span>
                    </div>
                    <div className="flex justify-between p-4 bg-white/20 rounded-lg">
                      <span className="text-neutral-700">Passengers</span>
                      <span className="font-semibold text-neutral-900">
                        {bookingData.passengers.adult > 0 &&
                          `${bookingData.passengers.adult} Adult${bookingData.passengers.adult > 1 ? 's' : ''}`}
                        {bookingData.passengers.senior > 0 &&
                          `, ${bookingData.passengers.senior} Senior`}
                        {bookingData.passengers.child > 0 &&
                          `, ${bookingData.passengers.child} Child`}
                      </span>
                    </div>
                    <div className="flex justify-between p-4 bg-metro-blue-50 border-2 border-metro-blue-500 rounded-lg">
                      <span className="font-semibold text-neutral-900">Total Paid</span>
                      <span className="font-bold text-metro-blue-500 text-xl">
                        ₹{bookingData.totalFare}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <GlassButton
                      variant="secondary"
                      size="lg"
                      onClick={() => navigate('/my-tickets')}
                      className="flex-1"
                    >
                      View All Tickets
                    </GlassButton>
                    <GlassButton
                      variant="primary"
                      size="lg"
                      onClick={() => navigate('/')}
                      className="flex-1"
                    >
                      Go Home
                    </GlassButton>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

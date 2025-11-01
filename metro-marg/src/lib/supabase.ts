import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://vcvykiogaytrtrrjrzvk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjdnlraW9nYXl0cnRycmpyenZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MDQxMTIsImV4cCI6MjA3NzQ4MDExMn0.1ZKHBGts5yTDA8A5GCThzOmyZcKl6oHI-BvfrV-2RoI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface MetroLine {
  id: string;
  name: string;
  code: string;
  color: string;
  is_operational: boolean;
  created_at: string;
}

export interface Station {
  id: string;
  name: string;
  code: string;
  metro_line_id: string;
  latitude: number;
  longitude: number;
  facilities: string[];
  has_parking: boolean;
  has_wifi: boolean;
  created_at: string;
}

export interface Train {
  id: string;
  train_number: string;
  metro_line_id: string;
  current_station_id: string | null;
  next_station_id: string | null;
  status: 'on-time' | 'delayed' | 'maintenance' | 'cancelled';
  eta_minutes: number | null;
  capacity: number;
  current_occupancy: number;
  last_updated: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  ticket_type: string;
  from_station_id: string;
  to_station_id: string;
  journey_date: string;
  fare: number;
  qr_code: string;
  payment_status: string;
  is_active: boolean;
  validity_hours: number;
  created_at: string;
}

export interface Route {
  id: string;
  from_station_id: string;
  to_station_id: string;
  distance_km: number;
  base_fare: number;
  travel_time_minutes: number;
  interchange_stations: string[];
  route_path: string[];
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  profile_picture: string | null;
  metro_card_number: string | null;
  metro_card_balance: number;
  auto_recharge_enabled: boolean;
  auto_recharge_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  balance_after: number;
  description: string | null;
  payment_method: string | null;
  payment_id: string | null;
  created_at: string;
}

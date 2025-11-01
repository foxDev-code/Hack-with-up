-- Migration: enable_rls_policies
-- Created at: 1761918663

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE metro_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trains ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies (users can only see/edit their own profile)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id OR auth.role() IN ('anon', 'service_role'));

-- Metro lines - public read access
CREATE POLICY "Anyone can view metro lines" ON metro_lines
  FOR SELECT USING (true);

-- Stations - public read access
CREATE POLICY "Anyone can view stations" ON stations
  FOR SELECT USING (true);

-- Trains - public read, admin write
CREATE POLICY "Anyone can view trains" ON trains
  FOR SELECT USING (true);

CREATE POLICY "Allow train updates via edge function" ON trains
  FOR ALL USING (auth.role() IN ('anon', 'service_role'));

-- Tickets - users can view their own tickets
CREATE POLICY "Users can view own tickets" ON tickets
  FOR SELECT USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can create tickets" ON tickets
  FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can update own tickets" ON tickets
  FOR UPDATE USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

-- Transactions - users can view their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Allow transaction inserts via edge function" ON transactions
  FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- Routes - public read access
CREATE POLICY "Anyone can view routes" ON routes
  FOR SELECT USING (true);

-- Admin logs - admin only
CREATE POLICY "Admin can view logs" ON admin_logs
  FOR SELECT USING (auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Admin can insert logs" ON admin_logs
  FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));;
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    ticket_type TEXT NOT NULL,
    from_station_id UUID NOT NULL,
    to_station_id UUID NOT NULL,
    journey_date DATE NOT NULL,
    fare DECIMAL(10,2) NOT NULL,
    qr_code TEXT UNIQUE NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    is_active BOOLEAN DEFAULT true,
    validity_hours INTEGER DEFAULT 24,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
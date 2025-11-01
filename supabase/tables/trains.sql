CREATE TABLE trains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    train_number TEXT UNIQUE NOT NULL,
    metro_line_id UUID NOT NULL,
    current_station_id UUID,
    next_station_id UUID,
    status TEXT DEFAULT 'on-time',
    eta_minutes INTEGER,
    capacity INTEGER DEFAULT 300,
    current_occupancy INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
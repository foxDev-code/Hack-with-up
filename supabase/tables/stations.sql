CREATE TABLE stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    metro_line_id UUID NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    facilities JSONB DEFAULT '[]',
    has_parking BOOLEAN DEFAULT false,
    has_wifi BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
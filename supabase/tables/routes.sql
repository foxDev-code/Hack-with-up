CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_station_id UUID NOT NULL,
    to_station_id UUID NOT NULL,
    distance_km DECIMAL(6,2),
    base_fare DECIMAL(10,2) NOT NULL,
    travel_time_minutes INTEGER,
    interchange_stations JSONB DEFAULT '[]',
    route_path JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
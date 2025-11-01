CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    profile_picture TEXT,
    metro_card_number TEXT UNIQUE,
    metro_card_balance DECIMAL(10,2) DEFAULT 0,
    auto_recharge_enabled BOOLEAN DEFAULT false,
    auto_recharge_threshold DECIMAL(10,2) DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
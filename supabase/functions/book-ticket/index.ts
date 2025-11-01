Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { fromStationId, toStationId, ticketType, journeyDate, fare } = await req.json();

        if (!fromStationId || !toStationId || !ticketType || !fare) {
            throw new Error('Missing required fields');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify token and get user
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        // Generate unique QR code
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 15);
        const qrCode = `METRO-${timestamp}-${randomStr}`;

        // Determine validity based on ticket type
        let validityHours = 24;
        if (ticketType === 'single_journey') {
            validityHours = 4;
        } else if (ticketType === 'day_pass') {
            validityHours = 24;
        } else if (ticketType === 'return_trip') {
            validityHours = 24;
        }

        // Create ticket
        const newTicket = {
            user_id: userId,
            ticket_type: ticketType,
            from_station_id: fromStationId,
            to_station_id: toStationId,
            journey_date: journeyDate || new Date().toISOString().split('T')[0],
            fare: fare,
            qr_code: qrCode,
            payment_status: 'completed',
            is_active: true,
            validity_hours: validityHours
        };

        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/tickets`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(newTicket)
        });

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            throw new Error(`Failed to create ticket: ${errorText}`);
        }

        const [ticket] = await insertResponse.json();

        // Create transaction record
        const transaction = {
            user_id: userId,
            transaction_type: 'ticket_purchase',
            amount: -fare,
            balance_after: 0, // Will be updated by frontend
            description: `Ticket purchased: ${ticketType}`,
            payment_method: 'online',
            payment_id: `PAY-${timestamp}`
        };

        await fetch(`${supabaseUrl}/rest/v1/transactions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transaction)
        });

        return new Response(JSON.stringify({
            data: ticket
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Ticket booking error:', error);

        const errorResponse = {
            error: {
                code: 'TICKET_BOOKING_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

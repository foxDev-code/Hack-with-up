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
        const { fromStationId, toStationId } = await req.json();

        if (!fromStationId || !toStationId) {
            throw new Error('From and to station IDs are required');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        // Check if route already exists
        const routeCheckResponse = await fetch(
            `${supabaseUrl}/rest/v1/routes?from_station_id=eq.${fromStationId}&to_station_id=eq.${toStationId}`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                }
            }
        );

        const existingRoutes = await routeCheckResponse.json();

        if (existingRoutes && existingRoutes.length > 0) {
            // Return existing route
            return new Response(JSON.stringify({
                data: existingRoutes[0]
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Fetch station details
        const [fromStationRes, toStationRes] = await Promise.all([
            fetch(`${supabaseUrl}/rest/v1/stations?id=eq.${fromStationId}`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                }
            }),
            fetch(`${supabaseUrl}/rest/v1/stations?id=eq.${toStationId}`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                }
            })
        ]);

        const [fromStation] = await fromStationRes.json();
        const [toStation] = await toStationRes.json();

        if (!fromStation || !toStation) {
            throw new Error('Invalid station IDs');
        }

        // Calculate distance using Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = (toStation.latitude - fromStation.latitude) * Math.PI / 180;
        const dLon = (toStation.longitude - fromStation.longitude) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(fromStation.latitude * Math.PI / 180) * Math.cos(toStation.latitude * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        // Calculate fare (base fare + distance-based)
        const baseFare = 10;
        const perKmRate = 2;
        const calculatedFare = baseFare + (distance * perKmRate);
        const fare = Math.round(calculatedFare);

        // Estimate travel time (average 40 km/h)
        const travelTime = Math.round((distance / 40) * 60);

        // Create route path (simplified - just from and to)
        const routePath = [fromStation.code, toStation.code];

        // Save calculated route
        const newRoute = {
            from_station_id: fromStationId,
            to_station_id: toStationId,
            distance_km: Math.round(distance * 100) / 100,
            base_fare: fare,
            travel_time_minutes: travelTime,
            route_path: routePath,
            interchange_stations: []
        };

        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/routes`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(newRoute)
        });

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            throw new Error(`Failed to save route: ${errorText}`);
        }

        const [savedRoute] = await insertResponse.json();

        return new Response(JSON.stringify({
            data: {
                ...savedRoute,
                from_station: fromStation,
                to_station: toStation
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Route calculation error:', error);

        const errorResponse = {
            error: {
                code: 'ROUTE_CALCULATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

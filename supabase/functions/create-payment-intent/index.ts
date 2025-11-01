// Enhanced Payment Intent with Error Handling - Metro मार्ग
Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, fromStationId, toStationId, passengers } = await req.json();

    // Validation
    if (!amount || amount <= 0) throw new Error('INVALID_AMOUNT: Amount must be positive');
    if (!fromStationId || !toStationId) throw new Error('MISSING_STATIONS: Stations required');
    if (fromStationId === toStationId) throw new Error('INVALID_ROUTE: Same station');
    
    const totalPass = Object.values(passengers || {}).reduce((s: number, c) => s + (c as number || 0), 0);
    if (totalPass <= 0) throw new Error('NO_PASSENGERS: At least 1 passenger required');

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Demo mode if no Stripe key
    if (!stripeKey) {
      const mockId = `pi_demo_${Date.now()}`;
      return new Response(JSON.stringify({
        data: {
          clientSecret: `${mockId}_secret`,
          paymentIntentId: mockId,
          amount,
          isDemoMode: true
        }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Real Stripe payment
    const params = new URLSearchParams();
    params.append('amount', Math.round(amount * 100).toString());
    params.append('currency', 'inr');
    params.append('payment_method_types[]', 'card');

    const stripeResp = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!stripeResp.ok) {
      const errText = await stripeResp.text();
      throw new Error(`STRIPE_ERROR: ${errText}`);
    }

    const paymentIntent = await stripeResp.json();

    return new Response(JSON.stringify({
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount,
        isDemoMode: false
      }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    const [code, msg] = error.message.split(':');
    return new Response(JSON.stringify({
      error: { code: code || 'ERROR', message: msg || error.message }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

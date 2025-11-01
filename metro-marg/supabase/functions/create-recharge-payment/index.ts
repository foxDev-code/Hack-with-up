Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { amount, userId } = await req.json();

        console.log('Recharge payment request:', { amount, userId });

        // Validate parameters
        if (!amount || amount <= 0) {
            throw new Error('Valid amount is required');
        }

        if (!userId) {
            throw new Error('User ID is required');
        }

        // Minimum recharge: Rs. 50
        if (amount < 50) {
            throw new Error('Minimum recharge amount is Rs. 50');
        }

        // Get Stripe secret key
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        if (!stripeSecretKey) {
            throw new Error('Stripe configuration missing');
        }

        // Create Stripe payment intent
        const stripeParams = new URLSearchParams();
        stripeParams.append('amount', Math.round(amount * 100).toString()); // Convert to paise (cents)
        stripeParams.append('currency', 'inr');
        stripeParams.append('payment_method_types[]', 'card');
        stripeParams.append('metadata[type]', 'metro_card_recharge');
        stripeParams.append('metadata[user_id]', userId);
        stripeParams.append('metadata[amount]', amount.toString());

        const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeSecretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: stripeParams.toString()
        });

        if (!stripeResponse.ok) {
            const errorData = await stripeResponse.text();
            console.error('Stripe API error:', errorData);
            throw new Error('Failed to create payment intent');
        }

        const paymentIntent = await stripeResponse.json();
        console.log('Payment intent created:', paymentIntent.id);

        return new Response(JSON.stringify({
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                amount: amount
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Payment creation error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'PAYMENT_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

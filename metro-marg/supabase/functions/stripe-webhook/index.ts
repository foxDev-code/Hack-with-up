Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const signature = req.headers.get('stripe-signature');
        const body = await req.text();
        
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!stripeSecretKey || !serviceRoleKey || !supabaseUrl) {
            throw new Error('Missing required environment variables');
        }

        // Parse the event
        const event = JSON.parse(body);
        
        console.log('Webhook received:', event.type);

        // Handle payment_intent.succeeded event
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const userId = paymentIntent.metadata.user_id;
            const amount = parseFloat(paymentIntent.metadata.amount);

            console.log('Processing successful payment:', { userId, amount, paymentIntentId: paymentIntent.id });

            if (!userId || !amount) {
                throw new Error('Missing metadata in payment intent');
            }

            // Update user's metro card balance
            const updateResponse = await fetch(
                `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        metro_card_balance: { __sql: `metro_card_balance + ${amount}` }
                    })
                }
            );

            if (!updateResponse.ok) {
                const error = await updateResponse.text();
                console.error('Failed to update balance:', error);
                throw new Error('Failed to update balance');
            }

            console.log('Balance updated successfully');

            // Create transaction record
            const transactionResponse = await fetch(
                `${supabaseUrl}/rest/v1/transactions`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        transaction_type: 'recharge',
                        type: 'recharge',
                        amount: amount,
                        status: 'completed',
                        description: `Metro card recharge via Stripe (${paymentIntent.id})`,
                        payment_method: 'stripe',
                        payment_id: paymentIntent.id
                    })
                }
            );

            if (!transactionResponse.ok) {
                const error = await transactionResponse.text();
                console.error('Failed to create transaction:', error);
                // Don't throw error here - balance is already updated
            } else {
                console.log('Transaction recorded successfully');
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Webhook error:', error);
        return new Response(JSON.stringify({
            error: {
                message: error.message
            }
        }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

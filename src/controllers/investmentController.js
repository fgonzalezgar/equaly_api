const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const PlanModel = require('../models/planModel');
const InvestmentModel = require('../models/investmentModel');

// Webhook Handler for Stripe
const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Stripe expects the raw body here
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        const stripePaymentId = session.id;
        const metadata = session.metadata;

        if (metadata && metadata.planId) {
            const planId = metadata.planId;
            // Find plan to get duration
            const plan = await PlanModel.findById(planId);
            const duration = plan ? plan.duration_days : 30;

            const now = new Date();
            const endDate = new Date(now);
            endDate.setDate(endDate.getDate() + duration);

            try {
                await InvestmentModel.updateStatus(stripePaymentId, 'active', now, endDate);
                console.log(`Investment ${stripePaymentId} activated via Webhook`);
            } catch (error) {
                console.error('Error updating investment status in webhook:', error);
            }
        }
    }

    res.json({ received: true });
};

const getPlans = async (req, res, next) => {
    try {
        const plans = await PlanModel.findAll();
        res.status(200).json({ success: true, data: plans });
    } catch (error) {
        next(error);
    }
};

const getUserInvestments = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const investments = await InvestmentModel.findByUserId(userId);
        res.status(200).json({ success: true, data: investments });
    } catch (error) {
        next(error);
    }
};

const createInvestmentIntent = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { planId, amount, paymentMethod } = req.body;

        // Verify plan exists
        const plan = await PlanModel.findById(planId);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'El plan no existe' });
        }

        // Validate amount limits
        if (amount < parseFloat(plan.min_amount) || amount > parseFloat(plan.max_amount)) {
            return res.status(400).json({
                success: false,
                message: `El monto debe estar entre $${plan.min_amount} y $${plan.max_amount} para este plan.`
            });
        }

        let stripePaymentId = null;
        let checkoutUrl = null;

        // Process Stripe if payment method is "Tarjeta Débito" (or credit card)
        if (paymentMethod === 'Tarjeta Débito' || paymentMethod === 'Stripe') {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: `Inversión: Plan ${plan.name}`,
                                description: `ROI: ${plan.daily_roi}% Diario por ${plan.duration_days} días`,
                            },
                            unit_amount: Math.round(amount * 100), // Stripe uses cents
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
                client_reference_id: userId.toString(),
                metadata: { userId: userId.toString(), planId: planId.toString(), amount: amount.toString() },
            });
            stripePaymentId = session.id;
            checkoutUrl = session.url;
        } else {
            // Mock external Crypto or Wallet payments flow for now
            stripePaymentId = `ext_pay_${Date.now()}`;
        }

        // Register pending investment
        const investment = await InvestmentModel.create({
            userId,
            planId,
            amount,
            paymentMethod,
            stripePaymentId
        });

        res.status(201).json({
            success: true,
            message: 'Inversión iniciada',
            data: {
                investment,
                checkoutUrl // Redirect User to this URL to complete payment in Stripe Hosted Checkout
            }
        });
    } catch (error) {
        next(error);
    }
};

const confirmInvestment = async (req, res, next) => {
    try {
        const { stripePaymentId } = req.body;

        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + 30);

        const investment = await InvestmentModel.updateStatus(stripePaymentId, 'active', now, endDate);

        res.status(200).json({
            success: true,
            message: 'Inversión procesada correctamente',
            data: investment
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPlans,
    getUserInvestments,
    createInvestmentIntent,
    confirmInvestment,
    handleStripeWebhook
};

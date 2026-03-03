const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const PlanModel = require('../models/planModel');
const InvestmentModel = require('../models/investmentModel');
const UserModel = require('../models/userModel');
const CommissionModel = require('../models/commissionModel');

// Reusable function to process referral logic
const processReferralBenefits = async (investment) => {
    try {
        const user = await UserModel.findById(investment.user_id);
        if (user && user.referred_by) {
            const commissionAmount = parseFloat(investment.amount) * 0.05; // 5% Commission
            await CommissionModel.create({
                userId: user.referred_by,
                fromUserId: user.id,
                investmentId: investment.id,
                type: 'referral_5',
                amount: commissionAmount,
                description: `Comisión del 5% por inversión de referido: ${user.first_name}`
            });
            console.log(`Commission of ${commissionAmount} logic processed for user ${user.referred_by}`);
        }
    } catch (error) {
        console.error('Error processing referral benefits:', error);
    }
};

// Webhook Handler for Stripe
const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const stripePaymentId = session.id;
        const metadata = session.metadata;

        if (metadata && metadata.planId) {
            const plan = await PlanModel.findById(metadata.planId);
            const duration = plan ? plan.duration_days : 30;
            const now = new Date();
            const endDate = new Date(now);
            endDate.setDate(endDate.getDate() + duration);

            try {
                const investment = await InvestmentModel.updateStatus(stripePaymentId, 'active', now, endDate);
                if (investment) {
                    await processReferralBenefits(investment);
                }
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

        const plan = await PlanModel.findById(planId);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'El plan no existe' });
        }

        if (amount < parseFloat(plan.min_amount) || amount > parseFloat(plan.max_amount)) {
            return res.status(400).json({
                success: false,
                message: `El monto debe estar entre $${plan.min_amount} y $${plan.max_amount} para este plan.`
            });
        }

        let stripePaymentId = null;
        let checkoutUrl = null;

        if (paymentMethod === 'Tarjeta Débito' || paymentMethod === 'Stripe') {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Inversión: Plan ${plan.name}`,
                            description: `ROI Diario: ${plan.daily_roi}%`,
                        },
                        unit_amount: Math.round(amount * 100),
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
                client_reference_id: userId.toString(),
                metadata: { userId: userId.toString(), planId: planId.toString(), amount: amount.toString() },
            });
            stripePaymentId = session.id;
            checkoutUrl = session.url;
        } else {
            stripePaymentId = `ext_pay_${Date.now()}`;
        }

        const investment = await InvestmentModel.create({
            userId, planId, amount, paymentMethod, stripePaymentId
        });

        res.status(201).json({
            success: true,
            data: { investment, checkoutUrl }
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
        if (investment) {
            await processReferralBenefits(investment);
        }

        res.status(200).json({ success: true, data: investment });
    } catch (error) {
        next(error);
    }
};

const checkPaymentStatus = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const investment = await InvestmentModel.findBySessionId(sessionId);
        if (!investment) {
            return res.status(404).json({ success: false, message: 'Inversión no encontrada' });
        }
        res.status(200).json({ success: true, status: investment.status, data: investment });
    } catch (error) {
        next(error);
    }
};

const getUserCommissions = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const commissions = await CommissionModel.findByUserId(userId);
        res.status(200).json({ success: true, data: commissions });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPlans,
    getUserInvestments,
    createInvestmentIntent,
    confirmInvestment,
    handleStripeWebhook,
    checkPaymentStatus,
    getUserCommissions
};

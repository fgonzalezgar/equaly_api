const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const investmentRoutes = require('./routes/investmentRoutes');
const errorHandler = require('./middlewares/errorHandler');
const swaggerSetup = require('./config/swagger');

const app = express();

// Webhook route must be before express.json() to receive raw body for Stripe signature
const investmentController = require('./controllers/investmentController');
app.post('/api/investments/webhook', express.raw({ type: 'application/json' }), investmentController.handleStripeWebhook);

// Regular Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/investments', investmentRoutes);

// Swagger Documentation Setup
swaggerSetup(app);

// Root Endpoint
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;

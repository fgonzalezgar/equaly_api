const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorHandler');
const swaggerSetup = require('./config/swagger');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/users', userRoutes);

// Swagger Documentation Setup
swaggerSetup(app);

// Root Endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Equaly Registration API',
        version: '1.0.0',
        description: 'REST API para el registro de usuarios del formulario Equaly.',
        documentation: '/api-docs',
        status: 'online'
    });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;

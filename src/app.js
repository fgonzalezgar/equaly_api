const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/users', userRoutes);

// Root Endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Equaly Registration API' });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;

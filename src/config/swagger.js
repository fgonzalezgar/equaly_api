const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Equaly Registration API',
        version: '1.0.0',
        description: 'API REST for Equaly User Registration Form. Includes PostgreSQL database with Supabase pooler.',
        contact: {
            name: 'API Support',
        },
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Local development server',
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ['./src/routes/*.js', './src/models/*.js'], // Paths to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

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
            url: 'https://equaly-api.vercel.app',
            description: 'Production server',
        },
        {
            url: 'http://localhost:3000',
            description: 'Local development server',
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: [path.join(__dirname, '../routes/*.js')], // Absolute path for Vercel
};

const swaggerSpec = swaggerJSDoc(options);

const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css";

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss:
            '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center !important; display: flex !important; flex-wrap: wrap !important; gap: 0 10px !important; padding: 0 10px !important; width: 100% !important; }',
        customCssUrl: CSS_URL,
        customJs: [
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js'
        ],
    }));
};

module.exports = setupSwagger;

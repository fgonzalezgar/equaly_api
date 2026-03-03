const swaggerJSDoc = require('swagger-jsdoc');
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

const setupSwagger = (app) => {
    // Endpoint to serve the raw swagger.json
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    // Endpoint to render the Swagger UI via CDN (Ensures Vercel Compatibility)
    app.get('/api-docs', (req, res) => {
        res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Equaly API - Swagger UI</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css" />
        <style>
          body { margin: 0; padding: 0; }
          .swagger-ui .topbar { background-color: #0f172a; }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js" crossorigin></script>
        <script>
          window.onload = () => {
            window.ui = SwaggerUIBundle({
              url: '/api-docs.json',
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.SwaggerUIStandalonePreset
              ],
            });
          };
        </script>
      </body>
      </html>
    `);
    });
};

module.exports = setupSwagger;

import { Router } from 'express';

const router = Router();

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'OpsPilot Enterprise ERP REST API',
    version: '1.0.0',
    description: 'Commercial-grade Mini ERP + CRM REST API with JWT Auth, RBAC, and Interconnected Workflows.',
  },
  servers: [{ url: 'http://localhost:5000/api', description: 'Local Development Server' }],
  paths: {
    '/auth/login': {
      post: {
        summary: 'Authenticate User & Issue JWT Tokens',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'admin@opspilot.com' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Authenticated successfully' } },
      },
    },
    '/crm/customers': {
      get: { summary: 'Get Paginated Customer List', responses: { 200: { description: 'Customer list' } } },
    },
    '/products/products': {
      get: { summary: 'Get Product Catalog', responses: { 200: { description: 'Product list' } } },
    },
    '/sales/orders': {
      get: { summary: 'Get Sales Orders', responses: { 200: { description: 'Orders list' } } },
    },
  },
};

router.get('/docs-json', (_req, res) => {
  return res.json(openApiSpec);
});

router.get('/docs', (_req, res) => {
  return res.send(`
    <! syntax-highlight >
    <!DOCTYPE html>
    <html>
      <head>
        <title>OpsPilot API Documentation</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
        <script>
          SwaggerUIBundle({ url: '/api/docs-json', dom_id: '#swagger-ui' });
        </script>
      </body>
    </html>
  `);
});

export default router;

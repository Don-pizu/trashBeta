// swagger.js


const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TrashBeta API',
      version: '1.0.0',
      description: 'API documentation for TrashBeta microservices',
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1', // for local development
        description: 'Local server',
      },
      {
        url: 'https://trashbeta.onrender.com/api/v1', // for deployment 
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], // Swagger will look for JSDoc comments in your route files
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};

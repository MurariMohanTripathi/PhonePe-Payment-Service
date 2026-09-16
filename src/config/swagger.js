const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "PhonePe Payment Service API",
      version: "1.0.0",
      description:
        "Centralized Node.js payment service using PhonePe Standard Checkout REST APIs.",
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development",
      },
      {
        url: "https://phonepe-payment-service.onrender.com",
        description: "Render deployment",
      },
    ],

    tags: [
      {
        name: "Payments",
        description: "Payment creation and status APIs",
      },
      {
        name: "Webhooks",
        description: "PhonePe webhook endpoints",
      },
      {
        name: "System",
        description: "Health and service endpoints",
      },
    ],
  },

  apis: [
    "./src/routes/*.js",
    "./src/app.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
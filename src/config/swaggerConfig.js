// src/config/swagger.js
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your Project API",
      version: "1.0.0",
      description: "API documentation for your Node + Express project",
    },
    servers: [
      {
        url: "http://localhost:1000", // change port if needed
      },
    ],
  },
  apis: [
    "./src/routes/*.js",
    "./src/modules/**/*.js",
  ], // Path to your route files
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };

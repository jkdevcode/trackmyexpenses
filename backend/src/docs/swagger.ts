import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import express from "express";
import { registerSchema, loginSchema, authResponseSchema } from "../docs/schemas/auth.schema.js";

export const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TrackMyExpenses API",
      version: "1.0.0",
      description: "Documentación de la API para TrackMyExpenses 🚀",
    },
    servers: [{ url: "http://localhost:3000/api" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Register: registerSchema,
        Login: loginSchema,
        AuthResponse: authResponseSchema,
      },
    },
  },
  apis: ["./src/routes/*.ts"], // 👈 ahora se documentan en las rutas
};

export function setupSwagger(app: express.Application) {
  const specs = swaggerJsdoc(swaggerOptions);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
}

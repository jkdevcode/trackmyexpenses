export const registerSchema = {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: { type: "string", example: "Juan Pérez" },
      email: { type: "string", example: "juan@example.com" },
      password: { type: "string", example: "12345678" },
    },
  };
  
  export const loginSchema = {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", example: "juan@example.com" },
      password: { type: "string", example: "12345678" },
    },
  };
  
  export const authResponseSchema = {
    type: "object",
    properties: {
      token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6..." },
      user: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Juan Pérez" },
          email: { type: "string", example: "juan@example.com" },
        },
      },
    },
  };
  
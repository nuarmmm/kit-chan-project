// swagger.js
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const isProd = process.env.NODE_ENV === "production";

/** @type {import('swagger-jsdoc').Options} */
const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Kit-Chan API",
      version: "1.0.0",
      description:
        "API documentation for Kit-Chan (Users, Events, Registrations) – includes JWT auth, pagination, and filtering.",
    },
    servers: [
      { url: "http://localhost:3000/api", description: "Local" },
      // ถ้า deploy แล้วใส่ URL ของคุณตรงนี้
      // { url: "https://your-domain.com/api", description: "Production" },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      parameters: {
        PageParam: {
          name: "page",
          in: "query",
          schema: { type: "integer", minimum: 1, default: 1 },
          description: "Page number (pagination)",
        },
        LimitParam: {
          name: "limit",
          in: "query",
          schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
          description: "Page size (pagination)",
        },
        SearchParam: {
          name: "search",
          in: "query",
          schema: { type: "string" },
          description: "Keyword search (name/title/email/etc.)",
        },
        FromParam: {
          name: "from",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Filter start date (YYYY-MM-DD)",
        },
        ToParam: {
          name: "to",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Filter end date (YYYY-MM-DD)",
        },
        SortParam: {
          name: "sort",
          in: "query",
          schema: { type: "string", example: "-createdAt" },
          description: "Sort field (prefix with '-' for desc)",
        },
      },
      schemas: {
        // ===== Common =====
        Meta: {
          type: "object",
          properties: {
            page: { type: "integer" },
            limit: { type: "integer" },
            total: { type: "integer" },
            pages: { type: "integer" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            code: { type: "string", example: "VALIDATION_ERROR" },
            details: { type: "array", items: { type: "string" } },
          },
        },

        // ===== Users =====
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "u_123" },
            name: { type: "string", example: "Alice" },
            email: { type: "string", format: "email", example: "alice@example.com" },
            role: { type: "string", example: "user" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        UserCreate: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
          },
        },
        UserUpdate: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            role: { type: "string" },
          },
        },

        // ===== Events =====
        Event: {
          type: "object",
          properties: {
            id: { type: "string", example: "e_123" },
            title: { type: "string", example: "Dev Meetup" },
            date: { type: "string", format: "date", example: "2025-10-01" },
            location: { type: "string", example: "BKK" },
            capacity: { type: "integer", example: 100 },
            description: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        EventCreate: {
          type: "object",
          required: ["title", "date"],
          properties: {
            title: { type: "string" },
            date: { type: "string", format: "date" },
            location: { type: "string" },
            capacity: { type: "integer" },
            description: { type: "string" },
          },
        },
        EventUpdate: {
          type: "object",
          properties: {
            title: { type: "string" },
            date: { type: "string", format: "date" },
            location: { type: "string" },
            capacity: { type: "integer" },
            description: { type: "string" },
          },
        },

        // ===== Registrations =====
        Registration: {
          type: "object",
          properties: {
            id: { type: "string", example: "r_123" },
            userId: { type: "string", example: "u_123" },
            eventId: { type: "string", example: "e_123" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        RegistrationCreate: {
          type: "object",
          required: ["userId", "eventId"],
          properties: {
            userId: { type: "string" },
            eventId: { type: "string" },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication & authorization" },
      { name: "Users", description: "Users CRUD" },
      { name: "Events", description: "Events CRUD & filters" },
      { name: "Registrations", description: "User ↔ Event registrations" },
    ],
    // ถ้าต้องการ require JWT ทุกเอ็นพอยต์ เปิดบรรทัดนี้
    // security: [{ BearerAuth: [] }],
  },
  // สแกนคอมเมนต์ @swagger ในไฟล์ routes/*
  apis: ["./src/routes/**/*.js", "./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
  // ทางลัด: เอา raw JSON ไปใช้ที่อื่นได้
  app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));
}

module.exports = { setupSwagger };

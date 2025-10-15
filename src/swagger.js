// swagger.js
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

/** @type {import('swagger-jsdoc').Options} */
const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Kit-Chan API",
      version: "1.0.0",
      description:
        "API for Users, Events, and Staff Applications (สมัครสตาฟ) – includes filters & pagination.",
    },
    servers: [{ url: 'http://localhost:3000/api', description: 'Local' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      parameters: {
        PageParam: { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 }, description: "Page number (pagination)" },
        LimitParam: { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 }, description: "Page size (pagination)" },
        SearchParam: { name: "search", in: "query", schema: { type: "string" }, description: "Keyword search (title/location)" },
        FromParam: { name: "from", in: "query", schema: { type: "string", format: "date" }, description: "Filter by start_at >= (YYYY-MM-DD)" },
        ToParam: { name: "to", in: "query", schema: { type: "string", format: "date" }, description: "Filter by start_at <= (YYYY-MM-DD)" },
        RegFromParam: { name: "reg_from", in: "query", schema: { type: "string", format: "date" }, description: "Filter by reg_open_at >= (YYYY-MM-DD)" },
        RegToParam: { name: "reg_to", in: "query", schema: { type: "string", format: "date" }, description: "Filter by reg_close_at <= (YYYY-MM-DD)" },
        SortParam: { name: "sort", in: "query", schema: { type: "string", example: "-start_at" }, description: "Sort field, prefix '-' for DESC" },
        PublishedParam: { name: "published", in: "query", schema: { type: "boolean" }, description: "Filter by is_published" },
      },
      schemas: {
        Meta: { type: "object", properties: { page: { type: "integer" }, limit: { type: "integer" }, total: { type: "integer" }, pages: { type: "integer" } } },

        // ===== Users =====
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            first_name: { type: "string" },
            last_name: { type: "string" },
            full_name: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["user", "admin"] },
            created_at: { type: "string", format: "date-time" },
          },
        },
        UserCreate: {
          type: "object",
          required: ["first_name", "last_name", "email", "password"],
          properties: {
            first_name: { type: "string" },
            last_name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
          },
        },
        UserUpdate: {
          type: "object",
          properties: {
            first_name: { type: "string" },
            last_name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            role: { type: "string", enum: ["user", "admin"] },
          },
        },

        // ===== Event =====
        Event: {
          type: "object",
          properties: {
            id: { type: "integer" },
            title: { type: "string" },
            description: { type: "string" },
            start_at: { type: "string", format: "date-time" },
            end_at: { type: "string", format: "date-time", nullable: true },
            reg_open_at: { type: "string", format: "date-time", nullable: true },
            reg_close_at: { type: "string", format: "date-time", nullable: true },
            organizer: { type: "string", nullable: true },
            registration_url: { type: "string", nullable: true },
            location: { type: "string", nullable: true },
            capacity: { type: "integer", nullable: true },
            is_published: { type: "boolean" },
            image_url: { type: "string", nullable: true },   // cover ถ้ามี
            images: { type: "array", items: { type: "string" } }, // รูปย่อยจาก event_images
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        EventCreate: {
          type: "object",
          required: ["title", "start_at"],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            start_at: { type: "string", format: "date-time" },
            end_at: { type: "string", format: "date-time" },
            reg_open_at: { type: "string", format: "date-time" },
            reg_close_at: { type: "string", format: "date-time" },
            organizer: { type: "string" },
            registration_url: { type: "string" },
            location: { type: "string" },
            capacity: { type: "integer" },
            is_published: { type: "boolean", default: false },
            image_url: { type: "string" },
            images: { type: "array", items: { type: "string" } } // optional array ของ S3 URLs
          },
        },
        EventUpdate: { $ref: "#/components/schemas/EventCreate" },

        // ===== Staff Applications =====
        StaffApplication: {
          type: "object",
          properties: {
            id: { type: "integer" },
            event_id: { type: "integer" },
            user_id: { type: "integer", nullable: true },
            applied_at: { type: "string", format: "date-time" },
            first_name: { type: "string" },
            last_name: { type: "string" },
            nickname: { type: "string" },
            phone: { type: "string" },
            major: { type: "string" },
            cohort: { type: "string" },
            student_code: { type: "string" },
            title: { type: "string" },
            status: { type: "string", enum: ["pending", "approved", "rejected"] },
          },
        },
        StaffApplicationCreate: {
          type: "object",
          required: ["first_name", "last_name", "email"],
          properties: {
            first_name: { type: "string" },
            last_name: { type: "string" },
            nickname: { type: "string" },
            phone: { type: "string" },
            major: { type: "string" },
            cohort: { type: "string" },
            student_code: { type: "string" },
            title: { type: "string" },
            email: { type: "string", format: "email" },
            position_applied: { type: "string" },
            experience: { type: "string" },
            motivation: { type: "string" },
            portfolio_url: { type: "string" },
            resume_s3_url: { type: "string" },
          }
        },
        StaffApplicationUpdate: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["pending", "approved", "rejected"] },
            first_name: { type: "string" },
            last_name: { type: "string" },
            nickname: { type: "string" },
            phone: { type: "string" }
          }
        }
      },
    },
    tags: [
      { name: "Users", description: "Users CRUD" },
      { name: "Events", description: "Events CRUD & filters" },
      { name: "StaffApplications", description: "สมัครสตาฟต่อกิจกรรม" },
    ],
  },
  apis: ['./src/routes/**/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
  app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));
}
module.exports = { setupSwagger };

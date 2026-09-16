const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const pool = require("./config/database");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const paymentRoutes = require("./routes/payment.routes");
const webhookRoutes = require("./routes/webhook.routes");

const app = express();
app.use(helmet());
app.use(cors());

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

app.use("/api/v1/webhooks",express.raw({
    type: "application/json",
}),
    webhookRoutes
)

app.use(express.json());

/**
 * @swagger
 * /:
 *   get:
 *     summary: Check API root
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Payment service API is running
 */
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Payment Service API is running",
    });
});
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check service health
 *     tags:
 *       - System
 *
 *     responses:
 *       200:
 *         description: Payment service is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: string
 *                   example: UP
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "UP",
        timestamp: new Date().toISOString(),
    });
});
/**
 * @swagger
 * /db-test:
 *   get:
 *     summary: Test PostgreSQL connection
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: PostgreSQL connected successfully
 *       500:
 *         description: Database connection failed
 */
app.get("/db-test", async (req, res) => {
    try {
        const result =
            await pool.query(
                "SELECT NOW() AS current_time"
            );

        res.status(200).json({
            success: true,
            message:"PostgreSQL connected successfully",
            databaseTime: result.rows[0].current_time,
        });

    } catch (error) {
        console.error(
            "Database connection failed:",
            error.message
        );
        res.status(500).json({
            success: false,
            message:
                "Database connection failed",
        });
    }
});

app.use("/api/v1/phonepe", paymentRoutes);

module.exports = app;

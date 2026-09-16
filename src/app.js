const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const pool = require("./config/database");

const paymentRoutes = require("./routes/payment.routes");
const webhookRoutes = require("./routes/webhook.routes");

const app = express();

app.use(helmet());
app.use(cors());

app.use("/api/v1/webhooks",express.raw({
    type: "application/json",
}),
    webhookRoutes
)

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Payment Service API is running",
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "UP",
        timestamp: new Date().toISOString(),
    });
});
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

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const datasetRoutes = require("./routes/datasetRoutes");

connectDB();

const app = express();

const allowedOrigins = [
    "http://localhost:1234",
    "http://localhost:3000",
    "https://ai-consumer-feedback-analysis.vercel.app"
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/datasets", datasetRoutes);

app.get("/", (req, res) => {
    res.json({
        mes: "Backend server is running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
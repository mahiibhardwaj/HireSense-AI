const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const analyzeRoutes = require("./routes/analyzeRoutes");
const historyRoutes = require("./routes/history");
const aiRewriteRoutes = require("./routes/aiRewriteRoutes");

const app = express(); 

// Connect Database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/history", historyRoutes);

app.use("/api/ai", aiRewriteRoutes);



// Home Route
app.get("/", (req, res) => {
    res.send("🚀 HireSense AI Running");
});

// Test Route
app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "API Working Successfully"
    });
});

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(` Server Running on Port ${PORT}`);
});
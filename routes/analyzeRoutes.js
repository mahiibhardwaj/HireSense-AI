const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const Analysis = require("../models/analysis");
const analyzeController = require("../controller/analyzeController");

// Analyze Resume
router.post(
  "/",
  upload.single("resume"),
  analyzeController.analyze
);

// Get History
router.get("/history", async (req, res) => {
  try {
    const data = await Analysis.find().sort({
      createdAt: -1,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch history",
      error: err.message,
    });
  }
});

module.exports = router;
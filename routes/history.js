const express = require("express");
const router = express.Router();
const History = require("../models/History");

// Save analysis
router.post("/save", async (req, res) => {
  try {
    const { email, result } = req.body;

    const newEntry = new History({
      email,
      result,
      createdAt: new Date(),
    });

    await newEntry.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get history
router.get("/:email", async (req, res) => {
  try {
    const data = await History.find({ email: req.params.email }).sort({
      createdAt: -1,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
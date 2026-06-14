const express = require("express");
const router = express.Router();

const { rewriteResume } = require("../services/geminiService");

router.post("/rewrite", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        message: "resumeText and jobDescription required",
      });
    }

    const improvedResume = await rewriteResume(
      resumeText,
      jobDescription
    );

    return res.json({
      success: true,
      improvedResume,
    });

  } catch (err) {
    console.error("REWRITE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
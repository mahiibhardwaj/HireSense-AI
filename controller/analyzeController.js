const fs = require("fs");
const pdf = require("pdf-parse");
const { analyzeResume } = require("../services/geminiService");
const Analysis = require("../models/analysis");

exports.analyze = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload resume PDF" });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdf(dataBuffer);
    const resumeText = pdfData.text;

    const { jobDescription } = req.body;

    console.log("Resume length:", resumeText.length);
    console.log("Calling Gemini...");

    const aiResponse = await analyzeResume(resumeText, jobDescription);

    console.log("Gemini Response:", aiResponse);

    //  CLEAN (no parsing chaos)
    const parsed = aiResponse;

    //  SIMPLIFIED SCORE HANDLING
    const cleanMatchScore = Number(parsed?.matchScore || 0);

    const saved = await Analysis.create({
      resume: resumeText,
      jobDescription: jobDescription || "",
      matchScore: cleanMatchScore,
      result: parsed,
    });

    return res.json({
      success: true,
      data: parsed,
      savedId: saved._id,
    });

  } catch (error) {
    console.error("ANALYZE ERROR:", error);

    return res.status(500).json({
      message: "Analysis Failed",
      error: error.message,
    });
  }
};
const Analysis = require("../models/analysis");

exports.getHistory = async (req, res) => {
  try {
    const history = await Analysis.find()
      .sort({ createdAt: -1 })
      .limit(20);

    const formatted = history.map(item => ({
      matchScore: JSON.parse(item.result).matchScore,
      strengths: JSON.parse(item.result).strengths,
      missingSkills: JSON.parse(item.result).missingSkills,
      suggestions: JSON.parse(item.result).suggestions,
      createdAt: item.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch history",
      error: err.message,
    });
  }
};
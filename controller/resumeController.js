const fs = require("fs");
const pdfParse = require("pdf-parse");
const Resume = require("../models/Resume");

const uploadResume = async (req, res) => {
   console.log("FILE:", req.file);
    console.log("BODY:", req.body);
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    // read PDF file
    const dataBuffer = fs.readFileSync(file.path);

    const pdfData = await pdfParse(dataBuffer);

    // save to DB
    const resume = await Resume.create({
      userId: req.user?.id, // later from JWT
      fileName: file.originalname,
      filePath: file.path,
      rawText: pdfData.text
    });

    res.status(201).json({
      message: "Resume uploaded successfully",
      resumeId: resume._id,
      extractedTextPreview: pdfData.text.substring(0, 300)
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Upload failed"
    });
  }
};

module.exports = { uploadResume };
const express = require("express");
const router = express.Router();
const upload = require("../config/multer");

router.post("/upload", upload.single("resume"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    res.json({
        message: "File uploaded successfully",
        file: req.file
    });
});

module.exports = router;
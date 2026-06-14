const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  selectRole
} = require("../controller/authController");

const authMiddleware = require("../middleware/authMiddleware");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Select role (protected route)
router.put("/role", authMiddleware, selectRole);

module.exports = router;
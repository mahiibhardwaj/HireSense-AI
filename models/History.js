const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema({
  email: String,
  result: Object,
  createdAt: Date,
});

module.exports = mongoose.model("History", HistorySchema);
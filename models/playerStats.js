const mongoose = require("mongoose");

var playerStatsSchema = new mongoose.Schema({
    totalHealth:{ type: Number, default: 10 },
    currentHealth: { type: Number, default: 10 },
    experiencePoints: { type: Number, default: 0 },
    currentLevel: { type: Number, default: 1}
});

module.exports = mongoose.model("PlayerStats", playerStatsSchema);
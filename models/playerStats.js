const mongoose = require("mongoose");

var playerStatsSchema = new mongoose.Schema({
    maxHealth:{ type: Number, default: 10 },
    currentHealth: { type: Number, default: 10 },
    maxEnergy: { type: Number, default: 10 },
    currentEnergy: { type: Number, default: 10},
    experiencePoints: { type: Number, default: 0 },
    rank: { type: Number, default: 1}
});

module.exports = mongoose.model("PlayerStats", playerStatsSchema);
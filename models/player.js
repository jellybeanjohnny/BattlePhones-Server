
const mongoose = require("mongoose");
const PlayerStats = require("./playerStats");
const Attack = require("./attack");
const Item = require("./item");

var playerSchema = new mongoose.Schema({
    displayName: String,
    uuid: { type: String, unique: true },
    attacks: { type: [Attack.schema], default: Attack() },
    items: [Item.schema],
    stats: { type: PlayerStats.schema, default: PlayerStats() },
    gold: { type: Number, default: 150 }
});

module.exports = mongoose.model("Player", playerSchema);
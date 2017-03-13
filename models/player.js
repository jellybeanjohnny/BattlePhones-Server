
const mongoose = require("mongoose");
const PlayerStats = require("./playerStats");
const Attack = require("./attack");

var playerSchema = new mongoose.Schema({
    displayName: String,
    uuid: { type: String, unique: true },
    attacks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attack"}],
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
    stats: { type: PlayerStats.schema, default: PlayerStats() },
    gold: { type: Number, default: 150 }
});

module.exports = mongoose.model("Player", playerSchema);
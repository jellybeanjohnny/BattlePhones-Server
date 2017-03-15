const mongoose = require("mongoose");

var attackSchema = new mongoose.Schema({
    name: { type: String, default: "Punch" },
    energyCost: {type: Number, default: 1},
    damageOutput: {type: Number, default: 2}
});

module.exports = mongoose.model("Attack", attackSchema);
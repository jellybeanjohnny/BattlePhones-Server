const mongoose = require("mongoose");

var attackSchema = new mongoose.Schema({
    name: String,
    energyCost: Number,
    damageOutput: Number
});

module.exports = mongoose.model("Attack", attackSchema);
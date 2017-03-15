const mongoose = require("mongoose");

var attackSchema = new mongoose.Schema({
    name: { type: String, default: "Flail" },
    energyCost: {type: Number, default: 1},
    damageOutput: {type: Number, default: 2},
    actionDescription: {type: String, default: "doesn't know how to fight and flails around wildly."}
});

module.exports = mongoose.model("Attack", attackSchema);
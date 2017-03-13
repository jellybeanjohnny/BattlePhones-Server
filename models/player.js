
const mongoose = require("mongoose");
var playerSchema = new mongoose.Schema({
    displayName: String,
    uuid: {
        type: String,
        unique: true
    }
});

module.exports = mongoose.model("Player", playerSchema);
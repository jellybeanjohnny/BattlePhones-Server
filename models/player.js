
const mongoose = require("mongoose");

// var playerSchema = new mongoose.Schema({
//     displayName: String,
//     uuid: {
//         type: String,
//         validate: {
//           validator: function(v, cb) {
//             Player.find({uuid: v}, function(err,docs){
//                cb(docs.length == 0);
//             });
//           },
//           message: 'Player already exists!'
//         }
//     }
// });

var playerSchema = new mongoose.Schema({
    displayName: String,
    uuid: {
        type: String,
        unique: true
    }
});

module.exports = mongoose.model("Player", playerSchema);
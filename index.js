const express = require("express");
const Player = require("./models/player");

var router = express.Router();

// Routes
router.get("/", function(request, response) {
    response.send("Hello! Welcome to the BattlePhones Server");
});

// Add a new player to the database
router.post("/player", function(request, response) {

    Player.create({
        displayName: request.body.displayName,
        uuid: request.body.uuid
    },function(error, newPlayer){
        if (error) {
            if (error.name === 'MongoError' && error.code === 11000) {
                handleExistingEntry(request.body.uuid, response);
            } else {
                console.log("Error creating player: " + error);
                response.status(500).json({"error" : error});
            }
        } else { 
            response.status(200).json({"player" : newPlayer});
        }
    });
});

function handleExistingEntry(uuid, response) {
    console.log("Player with uuid %s already exists in the database.", uuid);
    Player.findOne({uuid: uuid}, function(error, player) {
        response.status(200).json({"message" : "A player with this uuid already exists.", "player": player});
    });   
}

// Update some attribute on the player
router.put("player/:id", function(request, response) {

});

module.exports = router;
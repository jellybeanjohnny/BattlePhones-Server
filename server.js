const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Player = require('./models/player');
const Attack = require("./models/attack");
const databaseURL = process.env.DATABASE_URI || "mongodb://localhost/battlephonesdb";

mongoose.connect(databaseURL);

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

const server = http.createServer(app);
const websocketServer = new WebSocket.Server({server});

var port = process.env.PORT || 8080;

var connections = [];

var EventType = {
    playerJoinInactive : "playerJoinInactive",
    playerJoinActive   : "playerJoinActive",
    activePlayers      : "activePlayers",
    challengeRequest   : "challengeRequest"
};

server.listen(port, function(){
    console.log("Server started! Listening on port %d", server.address().port);
});

// Routes
app.get("/", function(request, response) {
    response.send("Hello! Welcome to the BattlePhones Server");
});

// Add a new player to the database
app.post("/player", function(request, response) {

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
app.put("player/:id", function(request, response) {

});

// Sockets
websocketServer.on('connection', function connection(connection) {
    console.log("Connection to web socket server started");

    connection.on("message", function incoming(message) {
        handleMessage(message, connection);
    });

    connection.on("close", function close(close) {
        handleDisconnect(close, connection);
    });
});

function handleMessage(message, connection) {
    var jsonObject = JSON.parse(message);
    if (jsonObject.eventType === EventType.playerJoinInactive) {
        addConnection(jsonObject, connection);
        broadcastActivePlayers();
    } else if (jsonObject.eventType === EventType.playerJoinActive) {
        playerDidBecomeActive(connection);
        broadcastActivePlayers(); 
    } else if (jsonObject.eventType === EventType.challengeRequest) {
        sendChallengeRequest(connection, jsonObject);
    }
}

function handleDisconnect(close, connection) {
    var index = connections.indexOf(connection);
    connections.splice(index, 1);
    broadcastActivePlayers()
    printConnections();
}

function addConnection(playerInfo, connection) {
    console.log("Adding connection with player info: " + JSON.stringify(playerInfo));
    connection.displayName = playerInfo.displayName;
    connection.uuid = playerInfo.uuid;
    connection.isActive = false;
    connections.push(connection);
    console.log(playerInfo.displayName + " has connected.");
    printConnections();
}

function playerDidBecomeActive(currentConnection) {
    connections.forEach(function(connection) {
        if (connection.uuid === currentConnection.uuid) {
            connection.isActive = true;
        }
    });
    console.log(currentConnection.displayName + " has become active.");
    printConnections();
}

function printConnections() {
    console.log("Total Connections " + connections.length);
    connections.forEach(function(connection) {
        console.log("DisplayName: " + connection.displayName);
        console.log("UUID: " + connection.uuid);
    });
}

function broadcastActivePlayers() {
    var activePlayers = [];
    connections.forEach(function(connection) {
        if (connection.isActive) {
            var playerInfo = {"displayName" : connection.displayName, "uuid" : connection.uuid};
            activePlayers.push(playerInfo);
        }
    });

    console.log("Active Players: " + activePlayers.length);

    var activePlayersJSONString = JSON.stringify({"eventType" : EventType.activePlayers,
                                              "activePlayers" : activePlayers});
    connections.forEach(function(connection) {
        connection.send(activePlayersJSONString);
    });
}

function sendChallengeRequest(senderConnection, receiverInfo) {

    receiverConnection = connections.find(function(connection) {
        console.log("first: " + connection.uuid + " second: "+ receiverInfo.opponentUUID);
        return connection.uuid === receiverInfo.opponentUUID;
    });

    var challengeRequest = {"challengerDisplayName" : senderConnection.displayName,
                            "challengerUUID": senderConnection.uuid};
    var challengeRequestJSONString = JSON.stringify(challengeRequest);

    receiverConnection.send(challengeRequestJSONString);
}
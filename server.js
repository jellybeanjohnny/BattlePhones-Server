const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost/battlephonesdb");

// SCHEMA SETUP. Do this in a different file later on
var playerSchema = new mongoose.Schema({
    displayName: String,
    uuid: {
        type: String,
        validate: {
          validator: function(v, cb) {
            Player.find({uuid: v}, function(err,docs){
               cb(docs.length == 0);
            });
          },
          message: 'Player already exists!'
        }
    }
});

var Player = mongoose.model("Player", playerSchema);

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

const server = http.createServer(app);
const websocketServer = new WebSocket.Server({server});

var port = process.env.PORT || 8080;

var connections = {"count" : 0};
var nextIDTicket = 0;

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
            if (error.name === "ValidationError") {
                console.log("Player with uuid %s already exists in the database.", request.body.uuid);
                response.status(200).send("A player with this uuid already exists.");
            } else {
                console.log("Error creating player: " + error);
            }
            
        } else {
            console.log("Created new player: " + newPlayer);  
            response.status(200).send("Successfully created new player");
        }
    });

});

// Update some attribute on the player
app.put("player/:id", function(request, response) {

});

// Sockets
websocketServer.on('connection', function connection(connection) {
    console.log("Connection to web socket server started");
    saveConnection(connection);

    connection.on("message", function incoming(message) {
        handleMessage(message, connection);
    });

    connection.on("close", function close(close) {
        handleDisconnect(close, connection);
    });
});

function handleMessage(message, connection) {
    var jsonObject = JSON.parse(message);
    if (jsonObject.eventType === "playerJoined") {
        playerDidJoin(jsonObject);
        connection.send("Welcome!");
    }
}

function handleDisconnect(close, connection) {
    delete connections[connection.generatedID];
    connections.count -= 1;
    printConnections();
}

function playerDidJoin(playerInfo) {
    console.log("%s joined the Lobby! Welcome %s!", playerInfo.username, playerInfo.username);
}

function printConnections() {
    console.log("Connected Player Count: " + connections.count);
}

function saveConnection(connection) {
    connections[nextIDTicket] = connection;
    connection.generatedID = nextIDTicket;
    nextIDTicket += 1;
    connections.count += 1;
    printConnections();
}

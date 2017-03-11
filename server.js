const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');

const app = express();

const server = http.createServer(app);
const websocketServer = new WebSocket.Server({server});

var port = process.env.PORT || 8080;

var connections = {"count" : 0};
var nextIDTicket = 0;

app.get("/", function(request, response) {
    response.send("Hello! Welcome to the BattlePhones Server");
});

server.listen(port, function(){
    console.log("Server started! Listening on port %d", server.address().port);
});

websocketServer.on('connection', function connection(connection) {
    console.log("Connection to web socket server started");
    saveConnection(connection);

    connection.on("message", function incoming(message) {
        handleMessage(message);
    });

    connection.on("close", function close(close) {
        handleDisconnect(close, connection);
    });
});

function handleMessage(message) {
    var jsonObject = JSON.parse(message);
    if (jsonObject.eventType === "playerJoined") {
        playerDidJoin(jsonObject);
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

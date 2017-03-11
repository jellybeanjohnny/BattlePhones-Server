const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');

const app = express();

const server = http.createServer(app);
const websocketServer = new WebSocket.Server({server});

app.get("/", function(request, response) {
    response.send("Hello! Welcome to the BattlePhones Server");
});

server.listen(8080, function(){
    console.log("Server started! Listening on port %d", server.address().port);
});

websocketServer.on('connection', function connection(connection) {
    console.log("Connection to web socket server started");

    connection.on("message", function incoming(message) {
        handleMessage(message);
    });

});

function handleMessage(message) {
    var isFirstMessage = false;
    var userName = null; 
    if (typeof message === 'string') {
        if (isFirstMessage) {
            userName = message;
            console.log(userName + " joined the Lobby! Welcome " + userName + "!");
        } else {
            console.log("Server received the following message: " + message);
        }

    }
    
    
}

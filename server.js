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

websocketServer.on('connection', function connection(websocket) {
    console.log("Connection to web socket server started");
});

server.listen(8080, function(){
    console.log("Server started! Listening on port %d", server.address().port);
});

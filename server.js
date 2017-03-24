const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const routes = require("./index");
const connectionManager = require("./connectionManager");
const databaseURL = process.env.DATABASE_URI || "mongodb://localhost/battlephonesdb";

mongoose.connect(databaseURL);

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(routes);

const server = http.createServer(app);
const websocketServer = new WebSocket.Server({server});

var port = process.env.PORT || 8080;

server.listen(port, function(){
    console.log("Server started! Listening on port %d", server.address().port);
});

// Sockets
websocketServer.on('connection', function connection(connection) {
    connectionManager.connectionStarted(connection);
});
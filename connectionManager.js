var connections = [];

var EventType = {
    playerJoinInactive : "playerJoinInactive",
    playerJoinActive   : "playerJoinActive",
    activePlayers      : "activePlayers",
    challengeRequest   : "challengeRequest",
    challengeResponse  : "challengeResponse"
};

module.exports = {
    connectionStarted: function(connection) {
        console.log("Connection to web socket server started");

        connection.on("message", function incoming(message) {
            handleMessage(message, connection);
        });

        connection.on("close", function close(close) {
            handleDisconnect(close, connection);
        });
    }
};

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
    } else if (jsonObject.eventType === EventType.challengeResponse) {
        sendChallengeResponse(connection ,jsonObject);
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
        return connection.uuid === receiverInfo.opponentUUID;
    });

    var challengeRequest = {"challengerDisplayName" : senderConnection.displayName,
                            "challengerUUID": senderConnection.uuid,
                            "eventType" : EventType.challengeRequest};
    var challengeRequestJSONString = JSON.stringify(challengeRequest);

    receiverConnection.send(challengeRequestJSONString);
}

function sendChallengeResponse(senderConnection, responseInfo) {
    opponentConnection = connections.find(function(connection) {
        return responseInfo.opponentUUID === connection.uuid;
    });

    var challengeResponse = {"eventType" : EventType.challengeResponse,
                             "challengeResponse" : responseInfo.challengeResponse,
                            "opponentUUID" : senderConnection.uuid};

    opponentConnection.send(JSON.stringify(challengeResponse));
}
var stompClient = null;

function connect(dataHandler, subscribeString, gameName, username) {
    var socket = new SockJS('/archers/game_data');
    stompClient = Stomp.over(socket);
    stompClient.debug = null;
    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        stompClient.subscribe(subscribeString, function (dt) {
            dataHandler(JSON.parse(dt.body));
        });
        stompClient.send("/app/game_data", {}, JSON.stringify({name: 'get_start_state', game: {name: gameName}, player: {name: username}}));
    });
}

function  disconnect() {
    if (stompClient != null) {
        stompClient.disconnect();
    }
    console.log("Disconnected");
}

function sendData(dt) {
    stompClient.send("/app/game_data", {}, JSON.stringify(dt));
}

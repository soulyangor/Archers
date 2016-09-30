'use strict';

App.controller('GamePanelController', ['$scope', 'GamePanelService',
    function ($scope, GamePanelService) {
        var self = this;
        var stompClient1 = null;
        var socket1 = null;
        var stompClient2 = null;
        var socket2 = null;
        var stompClient3 = null;
        var socket3 = null;
        self.username = localStorage.getItem('username');
        self.game = {name: localStorage.getItem('gameName'), host: null};
        self.players = [];

        self.connect = function (dataHandler) {
            socket1 = new SockJS('/archers/game_info');
            stompClient1 = Stomp.over(socket1);
            stompClient1.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                stompClient1.subscribe('/archers/' + self.game.name + '_info', function (dt) {
                    dataHandler(JSON.parse(dt.body));
                });
                stompClient1.send("/app/game_info", {}, JSON.stringify({name: 'get_game_players', game: self.game}));
            });
            socket2 = new SockJS('/archers/players_info');
            stompClient2 = Stomp.over(socket2);
            stompClient2.connect({}, function (frame) {
                console.log('Connected: ' + frame);
            });
            socket3 = new SockJS('/archers/games_info');
            stompClient3 = Stomp.over(socket3);
            stompClient3.connect({}, function (frame) {
                console.log('Connected: ' + frame);
            });
        };

        self.disconnect = function () {
            if (stompClient1 !== null) {
                stompClient1.disconnect();
            }
            if (stompClient2 !== null) {
                stompClient2.disconnect();
            }
            if (stompClient3 !== null) {
                stompClient3.disconnect();
            }
            console.log("Disconnected");
        };

        self.connectToServer = function () {
            self.connect(self.receiveGameInfo, self.receivePlayerRedy);
        };

        self.receiveGameInfo = function (data) {
            if (data !== null) {
                if (data.game !== undefined && data.name === 'start') {
                    localStorage.setItem('gameName', self.game.name);
                    window.location.href = "/archers/game";
                    return;
                }
                self.game = data;
                self.players = self.game.players;
                $scope.$apply();
            }
        };

        self.connectToServer();

        self.ready = function () {
            stompClient1.send("/app/game_info", {}, JSON.stringify({name: 'ready', game: self.game, player: {name: self.username}}));
            stompClient2.send("/app/players_info", {}, JSON.stringify({name: 'get_players'}));
        };

        self.isDisable = function () {
            for (var i = 0; i < self.players.length; i++) {
                if (self.players[i] !== undefined && self.players[i] !== null
                        && self.players[i].status !== 'готов') {
                    return true;
                }
            }
            return false;
        };

        self.isUser = function (player) {
            return player.name === self.username;
        };

        self.isShow = function () {
            return self.game.host !== null && self.game.host.name === self.username;
        };

        self.start = function () {
            stompClient2.send("/app/players_info", {}, JSON.stringify({name: 'get_players'}));
            stompClient3.send("/app/games_info", {}, JSON.stringify({name: 'get_games'}));
            stompClient1.send("/app/game_info", {}, JSON.stringify({name: 'start', game: self.game, player: {name: self.username}}));
        };

    }]);



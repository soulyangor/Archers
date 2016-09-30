'use strict';

App.controller('MainController', ['$scope', 'MainService',
    function ($scope, MainService) {
        var self = this;
        var stompClient1 = null;
        var socket1 = null;
        var stompClient2 = null;
        var socket2 = null;
        self.username = localStorage.getItem('username');
        self.game = {name: '', playersCount: 1};
        self.players = [];
        self.games = [];

        self.connect = function (dataHandler1, dataHandler2) {
            socket1 = new SockJS('/archers/players_info');
            stompClient1 = Stomp.over(socket1);
            stompClient1.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                stompClient1.subscribe('/archers/players_list', function (dt) {
                    dataHandler1(JSON.parse(dt.body));
                });
                stompClient1.send("/app/players_info", {}, JSON.stringify({name:'get_players'}));
            });
            socket2 = new SockJS('/archers/players_info');
            stompClient2 = Stomp.over(socket2);
            stompClient2.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                stompClient2.subscribe('/archers/games_list', function (dt) {
                    dataHandler2(JSON.parse(dt.body));
                });
                stompClient2.send("/app/games_info", {}, JSON.stringify({name:'get_games'}));
            });
        };

        self.disconnect = function () {
            if (stompClient1 !== null) {
                stompClient1.disconnect();
            }
            if (stompClient2 !== null) {
                stompClient2.disconnect();
            }
            console.log("Disconnected");
        };

        self.sendAndRedirect = function () {
            stompClient1.send("/app/players_info", {}, JSON.stringify({name:'get_players'}));
            stompClient2.send("/app/games_info", {}, JSON.stringify({name:'get_games'}));
            localStorage.setItem('gameName', self.game.name);
            window.location.href = "/archers/game_panel";
        };

        self.connectToServer = function () {
            self.connect(self.receivePlayersInfo, self.receiveGamesInfo);
        };

        self.receivePlayersInfo = function (data) {
            if (data !== null) {
                self.players = data;
                $scope.$apply();
            }
        };

        self.receiveGamesInfo = function (data) {
            if (data !== null) {
                self.games = data;
                $scope.$apply();
            }
        };

        self.connectToServer();

        self.createGame = function () {
            self.game.host = {name: self.username, status: ''};
            MainService.createGame(self.game)
                    .then(
                            self.sendAndRedirect,
                            function (errResponse) {
                                console.error('Error while creating Game');
                            }
                    );
        };

        self.connectToGame = function (game) {
            var command = {name:'connect_player'};
            command.game = game;
            command.player = {name: self.username, status: ''};
            self.game = game;
            MainService.updateGame(command)
                    .then(
                            self.sendAndRedirect,
                            function (errResponse) {
                                console.error('Error while creating Game');
                            }
                    );
        };

        self.fill = function (game) {
            return game.players.length + '/' + game.playersCount;
        };

        self.isDisabled = function (game) {
            return game.players.length >= game.playersCount;
        };

        self.isUser = function (player) {
            return player.name === self.username;
        };

    }]);



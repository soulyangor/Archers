'use strict';

App.controller('LoginController', ['$scope',
    function ($scope) {
        var self = this;
        var stompClient = null;
        var socket = null;
        self.username = null;

        self.connect = function (dataHandler) {
            socket = new SockJS('/archers/login');
            stompClient = Stomp.over(socket);
            stompClient.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                stompClient.subscribe('/archers/login_response', function (dt) {
                    dataHandler(dt.body);
                });
                stompClient.send("/app/login", {}, JSON.stringify({name: self.username, status: 'created'}));
            });
        };

        self.disconnect = function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            console.log("Disconnected");
        };

        self.connectToServer = function () {
            self.connect(self.receive);
        };

        self.receive = function (data) {
            console.log(data);
            if (data === "success") {
                localStorage.setItem('username', self.username);
                window.location.href = "/archers/main";
            } else {
                alert("Ошибка, пользователь с таким именем уже создан.");
            }
        };

    }]);



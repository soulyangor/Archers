'use strict';

App.factory('GamePanelService', ['$http', '$q', function ($http, $q) {

        self.headers = {};
        self.headers["Content-Type"] = 'application/json';

        return {
            createGame: function (game) {
                return $http.post('/archers/games/item',
                        JSON.stringify(game))
                        .then(
                                function (response) {
                                    return response.data;
                                },
                                function (errResponse) {
                                    console.error('Error while creating game');
                                    return $q.reject(errResponse);
                                }
                        );
            },
            updateGame: function (game) {
                return $http.put('/archers/games/item',
                        JSON.stringify(game))
                        .then(
                                function (response) {
                                    return response.data;
                                },
                                function (errResponse) {
                                    console.error('Error while updating game');
                                    return $q.reject(errResponse);
                                }
                        );
            }

        };
    }]);



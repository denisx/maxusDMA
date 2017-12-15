'use strict'

angular.module('bqpartone').factory('bqpartoneFactory', ['$http', '$window',
    ($http, $window) => {

        let factoryMethods = {};

        factoryMethods.getResultsForTable = (query) => {
            function successCall(data) {
                return data.data;
            };

            function errorCall(err) {
                return err;
            };

            return $http({
                method: 'POST',
                url: '/filters/gettablesobj',
				data: query
            }).then(successCall, errorCall);
        };

        return factoryMethods;

    }
])
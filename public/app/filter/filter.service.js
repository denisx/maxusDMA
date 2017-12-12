'use strict'

angular.module('filter').factory('optionsFilter', ['$http', '$window',
    ($http, $window) => {

        let factoryMethods = {};
        factoryMethods.refreshOptions = (query) => {
            function successCall(data) {
                return data.data;
            };

            function errorCall(err) {
                return err;
            };

            return $http({
                method: 'POST',
                url: '/campaignUnique',
                data: query
            }).then(successCall, errorCall);
        };

        return factoryMethods;

    }
])
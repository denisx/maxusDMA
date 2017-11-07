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

        factoryMethods.sendQueryNextPage = (query) => {
            console.log(query);

            function successCall(data) {

                console.log(data.status);
                if (data.status == 200) {
                    $window.location.href = 'filters';
                }
                return data;
            };

            function errorCall(err) {
                return err;
            };

            return $http({
                method: 'POST',
                url: '/filters',
                data: query
            }).then(successCall, errorCall);
        }
        return factoryMethods;

    }
])
'use strict'

angular.module('bqpartone').factory('bqpartoneFactory', ['$http', '$window',
    ($http, $window) => {

        let factoryMethods = {};

        factoryMethods.getResultsForTable = () => {
            function successCall(data) {
                return data.data;
            };

            function errorCall(err) {
                return err;
            };

            return $http({
                method: 'GET',
                url: '/filters/gettablesobj'
            }).then(successCall, errorCall);


        };

        factoryMethods.sendQueryNextPage = (query) => {
            console.log(query);

            function successCall(data) {

                console.log(data.status);
				$window.location.href = '/result';
                return data;
            };

            function errorCall(err) {
                return err;
                console.log('err')
            };

            return $http({
                method: 'POST',
                url: '/filters/answer',
                data: query
            }).then(successCall, errorCall);
        }

        return factoryMethods;

    }
])
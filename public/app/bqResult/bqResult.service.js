'use strict'

angular.module('bqResult').factory('bqResultFactory', ['$http',
    ($http) => {

        let factoryMethods = {};

        factoryMethods.getResultsForQuery = () => {
            function successCall(data) {
                return data.data;
            };

            function errorCall(err) {
                return err;
            };

            return $http({
                method: 'GET',
                url: '/query/tables'
            }).then(successCall, errorCall);

        };

        factoryMethods.getAnswerForQuery = () => {
            function successCall(data) {
                return data.data;
            };

            function errorCall(err) {
                return err;
            };

            return $http({
                method: 'GET',
                url: '/filters/answer'
            }).then(successCall, errorCall);

        };

        return factoryMethods;

    }
])
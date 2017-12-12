'use strict'

angular.module('bqResult').factory('bqResultFactory', ['$http',
    ($http) => {

        let factoryMethods = {};

//        factoryMethods.getResultsForQuery = () => {
//            function successCall(data) {
//                return data.data;
//            };
//
//            function errorCall(err) {
//                return err;
//            };
//
//            return $http({
//                method: 'GET',
//                url: '/query/tables'
//            }).then(successCall, errorCall);
//
//        };

        factoryMethods.getAnswerForQuery = (query) => {
            function successCall(data) {
                return data.data;
            };

            function errorCall(err) {
                return err;
            };

            return $http({
                method: 'POST',
                url: '/filters/answer',
				data: query
            }).then(successCall, errorCall);

        };

        return factoryMethods;

    }
])
'use strict'

angular.module('bqpartone').factory('bqpartoneFactory', ['$http', 
    ($http) => {

        let factoryMethods = {};

        factoryMethods.getResultsForTable = () => {
            function successCall(data) {return data;};

            function errorCall(err) {return err;};

            return $http({method: 'GET', url: '/filters/gettablesobj'}).then(successCall, errorCall);
            

        };

        return factoryMethods;

    }])
'use strict'

angular.module('filter').factory('optionsFilter', ['$http', 
    ($http) => {

    let factoryMethods = {};
    factoryMethods.refreshOptions = (query) => {
        function successCall(data) {return data.data;};

        function errorCall(err){return err;};

        return $http({method: 'POST', url: '/campaignUnique', data: query}).then(successCall, errorCall);
    };

    factoryMethods.sendQueryNextPage = (query) => {
        function successCall(data) {return data;};

        function errorCall(err){return err;};

        return $http({method: 'POST', url: '/filters', data: query}).then(successCall, errorCall);
    }
    return factoryMethods;
 
    }])
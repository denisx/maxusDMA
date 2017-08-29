'use strict'

angular.module('greeting').factory('name' , ['$http', ($http) => {
    function successCall(data) {
            return data.data;
        };
    
    function errorCall(err){
        return err;
    };

    return $http.get('http://localhost:8080/signin/').then(successCall, errorCall);
        
}]);
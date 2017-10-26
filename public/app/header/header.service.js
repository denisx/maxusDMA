angular.module('pagehead').factory('headFactory' , [
    '$http',  ($http) => {
    
    let exports = {};

    exports.getName = (user, pass) => {
        function successCall(data) {
			console.log(data);
        };
        
        function errorCall(err){
			console.log('err');
        }; 

        return $http({method: 'POST', url: '/signin/name', data: query}).then(successCall, errorCall);
    }
    return exports;
        
}]);
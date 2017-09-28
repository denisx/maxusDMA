angular.module('pagehead').factory('headFactory' , [
    '$http',  ($http) => {
    
    let exports = {};

    exports.login = (user, pass) => {
        function successCall(data) {
            let returnedArray=[];
            returnedArray.push(data.status);
            returnedArray.push(data.data.username);
            return returnedArray;
        };
        
        function errorCall(err){
            let returnedArray=[];
            returnedArray.push(err.status);
            returnedArray.push(err.data);
            return returnedArray;
        }; 
        let query = '{"username":"'+user+'", "password":"'+pass+'"}';
        return $http({method: 'POST', url: '/signin', data: query}).then(successCall, errorCall);
    }
    return exports;
        
}]);
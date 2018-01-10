angular.module('registration').factory('registrationFactory' , [
    '$http', '$window',  ($http,$window) => {
    
    let exports = {};

    exports.login = (user, pass) => {
        function successCall(data) {      
            let returnedArray=[];
            returnedArray.push(data.status);
            returnedArray.push(data.data.name);
            return returnedArray;
        };
        
        function errorCall(err){
			let returnedArray=[];
            returnedArray.push(err.status);
            returnedArray.push(err.data.message);
            return returnedArray;
        }; 
        let query = '{"username":"'+user+'", "password":"'+pass+'"}';
        return $http({method: 'POST', url: '/login', data: query}).then(successCall, errorCall);
    }
	
	exports.registration = (email, pass, name) => {
		function successCall(data) {
			let returnedArray=[];
            returnedArray.push(data.status);
            returnedArray.push(data.data.message);
            return returnedArray;
        };
        
        function errorCall(err){
			let returnedArray=[];
            returnedArray.push(err.status);
            returnedArray.push(err.data.message);
            return returnedArray;
        }; 
		
		let query = '{"email":"'+email+'", "password":"'+pass+'", "name":"'+name+'"}';
        return $http({method: 'POST', url: '/signup', data: query}).then(successCall, errorCall);
	}
	
	exports.lostPass = (email) => {
		function successCall(data) {      
            let returnedArray=[];
            returnedArray.push(data.status);
            returnedArray.push(data.data.message);
            return returnedArray;
        };
        
        function errorCall(err){
			let returnedArray=[];
            returnedArray.push(err.status);
            returnedArray.push(err.data.message);
            return returnedArray;
        }; 
        let query = '{"email":"'+email+'"}';
        return $http({method: 'POST', url: '/lostpass', data: query}).then(successCall, errorCall);
	}
    return exports;
        
}]);
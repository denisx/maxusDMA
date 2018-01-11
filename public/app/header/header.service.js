angular.module('pagehead').factory('headFactory' , [
    '$http',  ($http) => {
    
    let exports = {};    
		
	exports.changePassword = (oldPass, newPass) => {
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

		let query = '{"oldPass":"'+oldPass+'", "pass":"'+newPass+'"}';
		
        return $http({method: 'POST', url: '/changepass', data: query}).then(successCall, errorCall);
	}
	
	return exports;
        
}]);
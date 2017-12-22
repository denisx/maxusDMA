'use strict'

angular.module('bqResult').factory('bqResultFactory', ['$http',
    ($http) => {

        let factoryMethods = {};
		
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
		
		factoryMethods.unlinkFiles = (id) => {
			return $http({
				method: 'POST',
				url: '/filesunload',
				data: {id:id}
			})
		}
		
        return factoryMethods;

    }
])
'use strict'

angular.module('pagehead').controller('pageheadController', [
    '$scope', 'headFactory', ($scope, headFactory) => {
		
		$scope.popupState = 'login';
		
        if (sessionStorage.sessionUser == undefined) {
            $scope.headerLoginTrig = false;
        }
        else {
            $scope.headerLoginTrig = true;
            $scope.userName = sessionStorage.sessionUser;
        }

        let checkAuth = (status, message) => {
            if (status == 200) {
                sessionStorage.sessionUser = message;
                $scope.userName = sessionStorage.sessionUser;
                $scope.headerLoginTrig = true;
            }
        }
		
        $scope.login = () => {
            headFactory.login($scope.username, $scope.password).then((result)=>{checkAuth(result[0],result[1])});
        };
		
		$scope.registration = () => {
            return false;
        };
		
		$scope.lostPass = () => {
			return false;	
		};
		
		$scope.registrationForm = () => {
			$scope.popupState = 'registration';
		}
		
		$scope.lostPassForm = () => {
			$scope.popupState = 'lostPass';
		}
		
    }
]);
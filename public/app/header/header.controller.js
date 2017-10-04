'use strict'

angular.module('pagehead').controller('pageheadController', [
    '$scope', 'headFactory', ($scope, headFactory) => {
		
		$scope.popupState = 'login';
		
		$scope.user = {
			username: '',
			password: ''
		}
		
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
		
		let cleanInput = () => {
			let inputs = document.getElementById('loginPopup').getElementsByTagName('input');
			for (let i=0; i<inputs.length; i++) {
				inputs[i].text = '';
			}
			$scope.popupState = 'login';
		}
		
        $scope.login = () => {
            headFactory.login($scope.user.username, $scope.user.password).then((result)=>{checkAuth(result[0],result[1])});
        };
		
		$scope.registration = () => {
            return false;
        };
		
		$scope.lostPass = () => {
			return false;	
		};
		
		$scope.registrationForm = () => {
			$scope.popupState = 'registration';
		};
		
		$scope.lostPassForm = () => {
			$scope.popupState = 'lostPass';
		};
		
		$scope.modalListener = () => {
			document.addEventListener('click', function modalNull(e) {
				if(e.target.id == 'loginPopup') {
					cleanInput();
					document.removeEventListener('click', modalNull);
				}
			})
		};
		
    }
]);
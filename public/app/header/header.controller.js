'use strict'

angular.module('pagehead').controller('pageheadController', [
    '$scope', 'headFactory', ($scope, headFactory) => {
		
		$scope.user = {
			oldPassword : '',
			password : '',
			repeatPassword : ''
		}
		
		let checkInput = (type) => {
			switch (type) {
				case 'passMatch':
					if ($scope.user.password != document.querySelector("input[name='repeatPassword']").value) {
						document.querySelector("input[name='repeatPassword']").value = '';
						document.querySelector("input[name='repeatPassword']").placeholder = 'Пароли не совпадают';
						document.querySelector("input[name='repeatPassword']").classList.add('invalid');
						trig = false;
					}
					break;
				case 'passLength':
					if ($scope.user.password.length < 8) {
						$scope.user.password = '';
						document.querySelector("input[name='password']").placeholder = 'Пароль должен быть длиннее восьми символов';
						document.querySelector("input[name='password']").classList.add('invalid');
						trig = false;
					}
					break;
			}

		}

		let trig = true;
		
		let cleanInput = () => {
			Object.keys($scope.user).forEach((key) => {
				$scope.user[key] = '';
			})
		}
		
		$scope.changePass = () => {
			trig = true;
			checkInput('passLength');
			checkInput('passMatch');
			if (trig) {
				headFactory.changePassword($scope.user.oldPassword, $scope.user.password).then((result) => {
					if (result[0] == 200) {
						registrationSuccess(result[1])
					} else {
						$scope.failMsg = result[1];
					}
				});
			}	
		};
		
		let registrationSuccess = (msg) => {
			$scope.popupState = 'success';
			$scope.successMessage = msg;
		}
		
		document.addEventListener('click', (e) => {
			if (e.target.tagName == 'INPUT') {
				if (e.target.value != '') {
					e.target.classList.remove('invalid');
					e.target.placeholder = e.target.getAttribute('data-place');
				}

			}
		});
		
		let setName = () => {
			let cookies = document.cookie.split('; ');
			cookies.forEach((elem)=>{
				let content = elem.split('=');
				if (content[0] == 'name'){
					$scope.userName =  content[1];
				}
			})
			
		}
		setName();
		
		$scope.popupState = 'changePass';
    }
]);
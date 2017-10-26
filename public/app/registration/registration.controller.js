angular.module('registration').controller('registrationController', [
    '$scope', 'registrationFactory', ($scope, registrationFactory) => {	
		$scope.user = {
			username: '',
			password: '',
			name: ''
		}
		
		let trig = true;
		
		let cleanInput = () => {
			Object.keys($scope.user).forEach((key)=>{
				$scope.user[key] = '';
			})
		}
		
		let checkInput = (type) => {
			switch (type){
				case 'email':
					if ($scope.user.username.match(mailValid)==null){
						$scope.user.username='';
						document.querySelector("input[name='username']").placeholder = 'Указан неккоректный e-mail';
						document.querySelector("input[name='username']").classList.add('invalid');
						trig =  false;
					} 
					break;
				case 'passMatch':
					if ($scope.user.password != document.querySelector("input[name='repeatPassword']").value) {
						document.querySelector("input[name='repeatPassword']").value = '';
						document.querySelector("input[name='repeatPassword']").placeholder = 'Пароли не совпадают';
						document.querySelector("input[name='repeatPassword']").classList.add('invalid');
						trig =  false;
					}
					break;
				case 'passLength':
					if ($scope.user.password.length<8){
						$scope.user.password='';
						document.querySelector("input[name='password']").placeholder= 'Пароль должен быть длиннее восьми сиволов';
						document.querySelector("input[name='password']").classList.add('invalid');
						trig =  false;
					} 
					break;
				case 'name':
					if ($scope.user.name.match(nameValid)==null){
						console.log($scope.user.name);
						$scope.user.name='';
						document.querySelector("input[name='name']").placeholder= 'Имя должно содержать только русские буквы';
						document.querySelector("input[name='name']").classList.add('invalid');
						trig =  false;
					} 
					break;
			}
				
		}
		
		let changeValid = () => {
			let inputs = document.getElementsByTagName('input')
			for (let i=0; i<inputs.length; i++) {
				inputs[i].setCustomValidity('Поле обязательно для заполнения');
			}
		};
		
		let mailValid = new RegExp("^[a-z]+\.[a-z]+\@(maxusglobal|wavemaker)\.com", 'i');
		let nameValid = new RegExp("[А-я]+")
		
		let setNameCookie = (name) => {
			document.cookie = 'name=;expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
			let timeToDestroy = Date.now() + 3600000;
			document.cookie =  'name=' + name + '; expires=' + timeToDestroy.toString() + '; path=/;';
		}
		
        $scope.login = () => {
			$scope.failMsg = '';
			trig = true;
			checkInput('email');
			if(trig){
				registrationFactory.login($scope.user.username, $scope.user.password).then((result)=>{
					if (result[0]==200){
						setNameCookie(result[1]);		
					} else { 
						$scope.failMsg = result[1];
					}
				})
			}
            
        };
		
		$scope.registration = () => {
			$scope.failMsg = '';
			trig = true;
			checkInput('email');
			checkInput('passMatch');
			checkInput('passLength');
			checkInput('name');
			if (trig){
            	registrationFactory.registration($scope.user.username, $scope.user.password, $scope.user.name).then((result)=>{
					if(result[0]==200){
						registrationSuccess(result[1])
					} else {
						$scope.failMsg = result[1];
					}
																																  
				});
			}
				return false;
        };
		
		$scope.lostPass = () => {
			return false;	
		};
        
        $scope.loginForm = () => {
			cleanInput();
			$scope.popupState = 'login';
			changeValid();
			
		};

		$scope.registrationForm = () => {
			cleanInput();
			$scope.popupState = 'registration';
			changeValid();
		};
		
		$scope.lostPassForm = () => {
			cleanInput();
			$scope.popupState = 'lostPass';
			changeValid();
		};
		
		let registrationSuccess = (msg) => {
			$scope.popupState = 'success';
			$scope.successMessage = msg;
		}
		
		$scope.loginForm();
		
		document.addEventListener('click', (e) => {
			if (e.target.tagName == 'INPUT'){
				if (e.target.value != ''){
					e.target.classList.remove('invalid');
					e.target.placeholder = e.target.getAttribute('data-place');
				}
				
			}
		});
    }
]);
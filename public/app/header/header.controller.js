'use strict'

angular.module('pagehead').controller('pageheadController', [
    '$scope', 'headFactory', ($scope, headFactory) => {
		let setName = () => {
			let cookies = document.cookie.split(';');
			cookies.forEach((elem)=>{
				let content = elem.split('=');
				if (content[0] == 'name'){
					$scope.userName =  content[1];
				}
			})
			
		}
		setName();
    }
]);
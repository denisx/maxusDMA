'use strict'

angular.module('bqpartone').controller('preResultTable', ['$scope', 'bqpartoneFactory',
    ($scope, bqpartoneFactory) => {
		$scope.menuElements = {
			dataSource : {
				ga: {
					id : 'ga',
					name: 'Google Analytics',
					content : {
						dimension : ['industry', 'client', 'site', 'date', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'device_category'],
						metrics : ['visits', 'pageviews', 'bounces', 'session_duration']
					},
					chosen : {
						dimension : [],
						metrics : [],
						goals : 'no'
					}
				},
				ym: {
					id : 'ym',
					name: 'Yandex Metrika',
					content : {
						dimension : ['industry', 'client', 'site', 'date', 'isBounce', 'time_on_site', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'device_category', 'gender', 'age'],
						metrics : ['visits', 'users', 'pageviews']	
					},
					chosen : {
						dimension : [],
						metrics : [],
						goals : 'no'
					}
				}
			},
			postbuy: {
				id: 'postbuy',
				name: 'Postbuy',
				content : ['Test1', 'Test2', 'Test3', 'Test4'],
				chosen : []
			}, 
			campaign : {
				id : 'campaign',
				name: 'Кампании',
				content: [],
				chosen : []
			},
			placement : {
				id : 'placement',
				name: 'Размещение',
				content: [],
				chosen : []
			},
			medium : {
				id : 'medium',
				name: 'Medium',
				content: [],
				chosen : []
			},
			format : {
				id : 'format',
				name: 'Формат',
				content: [],
				chosen : []
			},
			sites : {
				id: 'sites',
				name: 'Сайты',
				content: [],
				chosen : []
			},
			client : {
				chosen : []
			},
			industry : {
				chosen : []
			},
			ad_goal : {
				chosen : []
			}
		};
		
		let answer = {}
			
		$scope.listenToHover = (currentBox) => {
			let currentMenuPoint = (currentBox.classList.contains('hoverToNewMenu')) ? currentBox : currentBox.closest('.hoverToNewMenu');
			$scope.menuToShow = currentMenuPoint.id;
			let menuPopupClassName = choosePopup();
			let menuPopup = document.getElementsByClassName(menuPopupClassName)[0];
			console.log(menuPopupClassName);
			console.log(menuPopup);
			
			menuPopup.setAttribute('type', $scope.menuToShow);
			menuPopup.classList.toggle('hideElement');
			
			document.addEventListener('click', function closeModal (e) {

				if((e.target.closest('.'+menuPopupClassName)==null)&&(e.target.closest('.hoverToNewMenu')!=currentMenuPoint)) {
					document.getElementsByClassName(menuPopupClassName)[0].classList.toggle('hideElement');
					document.removeEventListener('click', closeModal);
				}
				
				if(e.target.closest('.xContainer')!=null) {
					removeChosen(e.target.closest('.xContainer'));
					$scope.$apply();
				}
				
				if(e.target.closest('.elementToChooseMVW')!=null) {
					removeContent(e.target.closest('.elementToChooseMVW'));
					$scope.$apply();
				}

			});
		}
		
		$scope.sendReport = () => {
			Object.keys($scope.menuElements).forEach((key)=>{
				if (key == 'dataSource') {
					Object.keys($scope.menuElements[key]).forEach((innerKey)=>{
						answer[innerKey] = $scope.menuElements[key][innerKey].chosen;
					});
				} else {
					console.log(key);
					console.log($scope.menuElements[key].chosen);
					if ($scope.menuElements[key].chosen.length>0) {
						answer[key] = $scope.menuElements[key].chosen;
					}
				}
			});
			console.log(answer);
		};
		

		
		let getResults = () => {
            bqpartoneFactory.getResultsForTable()
                .then((data)=>{
					let tableContent = {
						data: data
					}
                  	//$scope.tableContentHeader = Object.keys(data[0]);
					$('#table').bootstrapTable(tableContent);
					fillMenuElements(data);
					fillBread();
					killLoader();
                });
        };
		
		let fillMenuElements = (tableData) => {
			let reqNames = ['Campaign', 'Placement', 'Medium', 'Format'];
			tableData.forEach((row)=>{
				reqNames.forEach((columnName)=>{
					row[columnName].split(',').forEach((elem)=>{
						if ($scope.menuElements[columnName.toLowerCase()].content.indexOf(elem) == -1) {
							$scope.menuElements[columnName.toLowerCase()].content.push(elem);
						}
					});
				});
			});
		};
		
		let fillBread = () => {
			let breadObj = {
				industry: [],
				client: [],
				ad_goal: []
			};
			document.cookie.split('; ').forEach((elem)=>{
				let content = elem.split('=');
				if (Object.keys(breadObj).includes(content[0])){
					$scope.menuElements[content[0]].chosen = elem.split('=')[1].split(', ');
				};
			});
		};
		
		
		let removeChosen = (target) => {
			let value = target.previousElementSibling.firstElementChild.textContent;
			let chosen, content;
			if (Object.keys($scope.menuElements.dataSource).includes($scope.menuToShow)){
				let paramName = $scope.menuElements.dataSource[$scope.menuToShow];			
				chosen = paramName.chosen[target.closest('.elementChosenMVW').parentNode.className];
				content = paramName.content[target.closest('.elementChosenMVW').parentNode.className];
			} else {
				let paramName = $scope.menuElements[$scope.menuToShow];
				chosen = paramName.chosen;
				content = paramName.content;
			}
			content.push(value);
			chosen.splice(chosen.indexOf(value),1);
		};
		
		let removeContent = (target) => {
			let value = target.firstElementChild.textContent;
			let chosen, content;
			if (Object.keys($scope.menuElements.dataSource).includes($scope.menuToShow)){
				let paramName = $scope.menuElements.dataSource[$scope.menuToShow];
				chosen = paramName.chosen[target.closest('.elementToChooseMVW').parentNode.className];
				content = paramName.content[target.closest('.elementToChooseMVW').parentNode.className];
			} else {
				let paramName = $scope.menuElements[$scope.menuToShow];
				chosen = paramName.chosen;
				content = paramName.content;
			}
			chosen.push(value);
			content.splice(content.indexOf(value),1);
//			
//			
//			
//			let paramName = (Object.keys($scope.menuElements.dataSource).includes($scope.menuToShow))? $scope.menuElements.dataSource[$scope.menuToShow] : $scope.menuElements[$scope.menuToShow];
//			paramName.chosen.push(value);
//			paramName.content.splice($scope.menuElements[$scope.menuToShow].content.indexOf(value),1);
		}
		
		
		
		let choosePopup = () => { 
			return (Object.keys($scope.menuElements.dataSource).includes($scope.menuToShow))? 'hoverMenuWithMetrics' : 'hoverMenuWithVariants';
		}

		
        let killLoader = () => {
            document.getElementsByClassName('loaderDiv')[0].innerHTML = '';
			document.getElementsByClassName('tableAppSection')[0].classList.remove('hideElement');
			document.getElementsByClassName('menuSection')[0].classList.remove('hideElement');
        };
		
		getResults();
		
		

    }]);
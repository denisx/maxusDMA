'use strict'

angular.module('bqpartone').controller('preResultTable', ['$scope', 'bqpartoneFactory',
    ($scope, bqpartoneFactory) => {
		$scope.menuElements = {
			data_source: {
				id : 'data_source',
				name: 'Источники',
				content : ['Google Analytics', 'Yandex Metrika', 'PostBuy', 'Tns']
			},
			ga: {
				id : 'ga',
				name: 'Google Analytics',
				content : ['ga1', 'ga2', 'ga3', 'ga4', 'ga5', 'ga6', 'ga7', 'ga8'],
//								content : ['Test1', 'Test2', 'Test3', 'Test4']
				chosen : []
			},
			ym: {
				id : 'ym',
				name: 'Yandex Metrika',
				content : ['ym1', 'ym2', 'ym3', 'ym4'],
				chosen : []
			},
			postbuy: {
				id: 'postbuy',
				name: 'Postbuy',
				content : ['Test1', 'Test2', 'Test3', 'Test4'],
				chosen : []
			}
			,
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
			}
		};
		
//		$scope.divClickCheck = (target) => {
//            if (target.className != 'elementToChooseMVW') {
//                target = target.closest('.elementToChooseMVW');
//            }
////			target.classList.toggle('elementToChooseMVWActive');
//			
//        };
//		
		$scope.listenToHover = (currentBox) => {
			let currentMenuPoint = (currentBox.classList.contains('hoverToNewMenu')) ? currentBox : currentBox.closest('.hoverToNewMenu');
			$scope.menuToShow = currentMenuPoint.id;
			let menuPopup = document.getElementsByClassName('hoverMenuWithVariants')[0];
			let top = currentMenuPoint.offsetTop/document.body.scrollHeight*100 + 3 + '%';
			let left = currentMenuPoint.offsetWidth/window.screen.availWidth*100 + 0.0875+ '%';
			menuPopup.style.left = left;
			menuPopup.style.top = top;
			menuPopup.setAttribute('type', $scope.menuToShow);
			menuPopup.classList.toggle('hideElement');
			
			document.addEventListener('click', function closeModal (e) {
				console.log(e.target);

				if((e.target.closest('.hoverMenuWithVariants')==null)&&(e.target.closest('.hoverToNewMenu')!=currentMenuPoint)) {
					console.log(e.target.closest('.hoverMenuWithVariants'))
					console.log(e.target.closest('.hoverToNewMenu'))
//					clearChosen();
					document.getElementsByClassName('hoverMenuWithVariants')[0].classList.toggle('hideElement');
					document.removeEventListener('click', closeModal);
				}
				if(e.target.closest('.xContainer')!=null) {
					removeChosen(e.target.closest('.xContainer').previousElementSibling.firstElementChild.textContent);
					$scope.$apply();
				}
				if(e.target.closest('.elementToChooseMVW')!=null) {
					removeContent(e.target.closest('.elementToChooseMVW').firstElementChild.textContent);
					$scope.$apply();
				}

			});
		}
		

		
		let getResults = () => {
            bqpartoneFactory.getResultsForTable()
                .then((data)=>{
					let tableContent = {
						data: data
					}
                  	//$scope.tableContentHeader = Object.keys(data[0]);
					$('#table').bootstrapTable(tableContent);
					fillMenuElements(data);
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
		
		let removeChosen = (value) => {	
			$scope.menuElements[$scope.menuToShow].content.push(value);
			$scope.menuElements[$scope.menuToShow].chosen.splice($scope.menuElements[$scope.menuToShow].chosen.indexOf(value),1);
		};
		
		let removeContent = (value) => {
			$scope.menuElements[$scope.menuToShow].chosen.push(value);
			$scope.menuElements[$scope.menuToShow].content.splice($scope.menuElements[$scope.menuToShow].content.indexOf(value),1);
		}

//		let checkChosen = () => {
//			
////			$scope.menuElements[$scope.menuToShow].chosen.forEach((elem)=>{
////				console.log(elem, $scope.menuToShow, $scope.menuElements[$scope.menuToShow].content.indexOf(elem), elemArray[$scope.menuElements[$scope.menuToShow].content.indexOf(elem)]);
////				console.log(elemArray);
////				elemArray[$scope.menuElements[$scope.menuToShow].content.indexOf(elem)].classList.add('elementToChooseMVWActive');
////			});
//			let indexes = [];
//			for (let i = 0; i < $scope.menuElements[$scope.menuToShow].content.length; i++){
//				if ($scope.menuElements[$scope.menuToShow].chosen.includes($scope.menuElements[$scope.menuToShow].content[i])) {
//					indexes.push(i);
//					
//				}
//			}
//			let elemArray = document.getElementsByClassName('elementToChooseMVW');
//			indexes.forEach((ind)=>{
//				elemArray[ind].classList.add('elementToChooseMVWActive');
//			})
//			console.log('============');
//		};
		
//		let clearChosen = () => {
//			let elemArray = document.getElementsByClassName('elementToChooseMVW');
//			for (let i = 0; i< elemArray.length; i++) {
//				if (elemArray[i].classList.contains('elementToChooseMVWActive')){
//					elemArray[i].classList.remove('elementToChooseMVWActive');
//				}
//			}
//		}
//		

		
        let killLoader = () => {
            document.getElementsByClassName('loaderDiv')[0].innerHTML = '';
			document.getElementsByClassName('tableAppSection')[0].classList.remove('hideElement');
			document.getElementsByClassName('menuSection')[0].classList.remove('hideElement');
        };
		
		getResults();
		
		

    }]);
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
				content : ['Test1', 'Test2', 'Test3', 'Test4', 'Test1', 'Test2', 'Test3', 'Test4'],
//								content : ['Test1', 'Test2', 'Test3', 'Test4']
				chosen : []
			},
			ym: {
				id : 'ym',
				name: 'Yandex Metrika',
				content : ['Test1', 'Test2', 'Test3', 'Test4'],
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
		
        $scope.showDropdown =  (eventTarget) => {
            if (eventTarget.className != 'customReportBoxDropdownButton') {
                eventTarget = eventTarget.closest('.customReportBoxDropdownButton');
            }
			eventTarget.classList.toggle('cRBDBPActive');
            hideShowBoxes(eventTarget.nextElementSibling);
            document.addEventListener('click', function hideDrop(e) {				
                if (e.target.closest('.customReportBoxMainArea')!= eventTarget.parentNode) {                 
                    hideShowBoxes(eventTarget.nextElementSibling);
					eventTarget.classList.toggle('cRBDBPActive');
                    document.removeEventListener('click', hideDrop);
                }
            });
        };
		
		$scope.divClickCheck = (target) => {
            if (target.className != 'elementToChooseMVW') {
                target = target.closest('.elementToChooseMVW');
            }
			let currentData = $scope.menuElements[$scope.menuToShow];
			let chosenOne = target.firstElementChild.textContent;
           	(currentData.chosen.indexOf(chosenOne) == -1) ?	currentData.chosen.push(chosenOne) : currentData.chosen.splice(currentData.chosen.indexOf(chosenOne), 1);
			console.log($scope.menuElements[$scope.menuToShow]);
        };
		
		let getResults = () => {
            bqpartoneFactory.getResultsForTable()
                .then((data)=>{
                  	$scope.tableContentHeader = Object.keys(data[0]);
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
		
		
//		let hideShowBoxes = (currentBox) =>{
//            currentBox.classList.toggle('hideElement');
//        };
//		
		$scope.listenToHover = (currentBox) => {
			let currentMenuPoint = (currentBox.classList.contains('hoverToNewMenu')) ? currentBox : currentBox.closest('.hoverToNewMenu');
			$scope.menuToShow = currentMenuPoint.id;
			let top = currentMenuPoint.offsetTop/document.body.scrollHeight*100 + 3 + '%';
			let left = currentMenuPoint.offsetWidth/window.screen.availWidth*100 + 0.0875+ '%';
			document.getElementsByClassName('hoverMenuWithVariants')[0].style.left = left;
			document.getElementsByClassName('hoverMenuWithVariants')[0].style.top = top;
			document.getElementsByClassName('hoverMenuWithVariants')[0].classList.toggle('hideElement');
			document.addEventListener('click', function closeModal (e) {
				if((e.target.closest('.hoverMenuWithVariants')==null)&&(e.target.closest('.hoverToNewMenu')!=currentMenuPoint)) {
					document.getElementsByClassName('hoverMenuWithVariants')[0].classList.toggle('hideElement');
					document.removeEventListener('click', closeModal);
				}
			});
		}
		
        let killLoader = () => {
            document.getElementsByClassName('loaderDiv')[0].innerHTML = '';
			document.getElementsByClassName('tableAppSection')[0].classList.remove('hideElement');
			document.getElementsByClassName('menuSection')[0].classList.remove('hideElement');
        };
		
		getResults();
		
		

    }]);
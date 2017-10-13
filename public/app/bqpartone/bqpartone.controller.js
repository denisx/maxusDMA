'use strict'

angular.module('bqpartone').controller('preResultTable', ['$scope', 'bqpartoneFactory',
    ($scope, bqpartoneFactory) => {
		$scope.menuElements = {
			data_source: {
				id : 'data_source',
				name: 'Источники',
				content : ['Google Analytics', 'Yandex.Metrika', 'PostBuy', 'Tns']
			},
			campaign : {
				id : 'campaign',
				name: 'Кампании',
				content: []
			},
			placement : {
				id : 'placement',
				name: 'Размещение',
				content: []
			},
			medium : {
				id : 'medium',
				name: 'Medium',
				content: []
			},
			format : {
				id : 'format',
				name: 'Формат',
				content: []
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
            if (target.className != 'cRBDCValue') {
                target = target.closest('.cRBDCValue');
            }
            target.classList.toggle('cRBDCVActive');
			target.getElementsByTagName('input')[0].checked = (target.getElementsByTagName('input')[0].checked) ? false : true;
        };
		
		let getResults = () => {
            bqpartoneFactory.getResultsForTable()
                .then((data)=>{
					console.log(data.data);
                    $scope.tableContentHeader = data.data[0];
                    $scope.tableContent = data.data.slice(1);
					fillMenuElements($scope.tableContentHeader, $scope.tableContent);
					killLoader();
                });
        };
		
		let fillMenuElements = (columnNames, tableData) => {
			let reqNames = [columnNames.indexOf('Campaign'), columnNames.indexOf('Placement'), columnNames.indexOf('Medium'), columnNames.indexOf('Format')];
			console.log($scope.menuElements);
			tableData.forEach((row)=>{
				reqNames.forEach((indx)=>{
					row[indx].split(',').forEach((elem)=>{
						if ($scope.menuElements[columnNames[indx].toLowerCase()].content.indexOf(elem) == -1) {
							$scope.menuElements[columnNames[indx].toLowerCase()].content.push(elem);
						}
					});
				});
			});
		};
		
		
		let hideShowBoxes = (currentBox) =>{
            currentBox.classList.toggle('hideElement');
        };
		
        let killLoader = () => {
            document.getElementsByClassName('loaderDiv')[0].innerHTML = '';
			document.getElementsByClassName('tableAppSection')[0].classList.remove('hideElement');
			document.getElementsByClassName('menuSection')[0].classList.remove('hideElement');
        };

		getResults();

		

    }]);
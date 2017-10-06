'use strict'

angular.module('bqpartone').controller('preResultTable', ['$scope', 'bqpartoneFactory',
    ($scope, bqpartoneFactory) => {
		$scope.menuElements = {
			data_source: {
				name: 'Источники',
				content : ['Google Analytics', 'Yandex.Metrika', 'PostBuy', 'Tns']
			},
			Campaign : {
				name: 'Кампании',
				content: []
			},
			Placement : {
				name: 'Размещение',
				content: []
			},
			Medium : {
				name: 'Medium',
				content: []
			},
			Format : {
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
			tableData.forEach((row)=>{
				reqNames.forEach((indx)=>{
					row[indx].split(',').forEach((elem)=>{
						if ($scope.menuElements[columnNames[indx]].content.indexOf(elem) == -1) {
							$scope.menuElements[columnNames[indx]].content.push(elem);
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
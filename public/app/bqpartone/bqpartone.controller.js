'use strict'

angular.module('bqpartone').controller('preResultTable', ['$scope', 'bqpartoneFactory',
    ($scope, bqpartoneFactory) => {
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
                    killLoader();
                    $scope.tableContentHeader = data.data[0];
                    $scope.tableContent = data.data;
                    $scope.tableContent.splice(0,1);
                });
        };
		
		let hideShowBoxes = (currentBox) =>{
			console.log(currentBox);
            currentBox.classList.toggle('hideElement');
        };
		
        let killLoader = () => {
            document.getElementsByClassName('loaderDiv')[0].innerHTML = '';
			document.getElementsByClassName('tableAppSection')[0].classList.remove('hideElement');
        };

            getResults();

		

    }]);
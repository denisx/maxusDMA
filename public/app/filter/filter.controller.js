'use strict'

angular.module('filter').controller('filterController', ['$scope', 'optionsFilter', '$location',
    ($scope, optionsFilter, $location) => {

        let query = {};
        let queryCurrent = [];

        // refreshing current values for filters
        function changeValues(q, eventTarget, keyName) {
            optionsFilter.refreshOptions(q)
                .then((r) => {
                    $scope.filters = r;
                });
        };

		//Refactore \/
        // open/close chosen div
        function hideShowBoxes(currentBox, currentButton, state1, state2){
            currentBox.style.display = state1;
            currentButton.style.display = state2;
        };

        // recoloring checked option
		//refactore \/
        function checkedFieldColor(currentField, state){
            let curFilParent = currentField.parentNode.classList;
            let curFilElemByTag = currentField.parentNode.getElementsByTagName('p')[0].classList;
            if (state == 'active'){
                curFilParent.remove('sBDCVPassive');
                curFilParent.add('sBDCVActive');
                curFilElemByTag.remove('sBDCValuePPassive');
                curFilElemByTag.add('sBDCValuePActive');
            }
            else {
                curFilParent.remove('sBDCVActive');
                curFilParent.add('sBDCVPassive');
                curFilElemByTag.remove('sBDCValuePActive');
                curFilElemByTag.add('sBDCValuePPassive');
            }
        };  

        function clearSearchBox(id){
            if ($scope.searchFilter != undefined) {
                $scope.searchFilter[id] = '';
            };
        }

		let changeTitleForBox = (element, keyName) => {
			
				
			let newString = '';
			let newStringHover = '';
				switch (query[keyName].length) {
					case 1:
						newString = 'Выбран '+ query[keyName].length + ' элемент';
						break;
					case 2:
					case 3:
					case 4:
						newString = 'Выбрано '+ query[keyName].length + ' элемента';
						break;
					default:
						newString = 'Выбрано '+ query[keyName].length + ' элементов';
				}
			query[keyName].forEach((elem)=>{
				newStringHover += elem + ', '; 
			});
			newStringHover = newStringHover.slice(0, -2);
			element.getElementsByClassName('selectBoxDropdownButtonText')[0].textContent = newString;
			element.parentNode.getElementsByClassName('selectBoxHoverInfoP')[0].textContent = newStringHover;
			
		};
		
		
        //filter for matching by the search field
        $scope.searchFilterFunc = (arr, val) => {
            return function(item) {
                if (item[arr].match(RegExp(val, 'i'))) return true;
            }
        }

        // tracking for opening and closing current div, calling 
        $scope.showDropdown =  (eventTarget , keyName) => {
            if (eventTarget.tagName != 'DIV') {
                eventTarget = eventTarget.closest('.selectBoxDropdownButton');
            }
            hideShowBoxes(eventTarget.nextElementSibling, eventTarget, 'inline-block', 'none');
            document.addEventListener('click', function hideDrop(e) {
				
                if (e.target.closest('.selectBoxMainArea')!= eventTarget.parentNode) {
                    clearSearchBox(keyName);
                    if (queryCurrent.length > 0){
                        query[keyName] = queryCurrent;
						changeTitleForBox(eventTarget, keyName);
                        queryCurrent = [];
                        changeValues(query, eventTarget, keyName);
                    }

                    
                    hideShowBoxes(eventTarget.nextElementSibling, eventTarget, 'none', 'inline-block');

                    document.removeEventListener('click', hideDrop);
                }
            });
        };


		$scope.showHoverDivInfo = (e) => {
			let top = e.clientY - 10 + "px";
			let left = e.clientX + 20  + "px";
			let hovDiv = e.target.closest('.selectBoxMainArea').getElementsByClassName('selectBoxHoverInfo')[0];
			hovDiv.style.left = left;
			hovDiv.style.top = top;
			
		};
		
        // Refactore this \/
        $scope.divClickCheck = (a, keyName) => {
            let d = document.getElementById(a).checked;
            document.addEventListener('click', function chkBox(e) {
                    if (d) {
                        document.getElementById(a).checked = false;
                        if (queryCurrent.indexOf(a) != -1){
                            queryCurrent.splice(queryCurrent.indexOf(a), 1);
                        }
                        checkedFieldColor(document.getElementById(a), 'passive');
                    } else {
                        document.getElementById(a).checked = true;
                        if (queryCurrent.indexOf(a) == -1) {
							let curVal = a;
							if (a.includes('brand_')) {
								curVal = a.slice(a.indexOf('_')+1);
							}
                            queryCurrent.push(curVal);
                        }
                        checkedFieldColor(document.getElementById(a), 'active');
                    }
                console.log(queryCurrent);
                document.removeEventListener('click', chkBox);
            });
        };


        $scope.checkBoxSelectDismissAll = (d, keyName) => {
            let state;
            let divState;
            let currentInputs = d.closest('.selectBoxDropdownContainer').getElementsByClassName('sBDCValueContainer')[0].getElementsByTagName('input');
            if (d.className == 'sBDCBCButtonOk') {
                state = true;
                divState = 'active';
                let a = [];
                for (let i = 0; i < currentInputs.length; i++){
                    a.push(currentInputs[i].id);
                }
                queryCurrent = a;
            } else {
                state = false;
                divState = 'passive';
                queryCurrent = [];
                clearSearchBox(keyName);
            }
            for (let i = 0; i<currentInputs.length; i++){
                currentInputs[i].checked = state;
                checkedFieldColor(currentInputs[i], divState);
            }

            document.removeEventListener('click', d); 
        }

        // restore default values
        $scope.queryNull = () => {
			//Object.keys(query).forEach
            query = {};
            changeValues(query);
        }
 
        $scope.nextPage = () => {
			setTimeout(()=>{optionsFilter.sendQueryNextPage(query)}, 1);
            
        }
		
        $scope.showHideAdvancedFilters = () => {
            let aFB = document.getElementsByClassName('advancedFilterContainer')[0]; 
            if (aFB.classList.contains('hideElement')){
                aFB.classList.remove('hideElement');
                document.getElementsByClassName('refreshFiltersLink')[0].classList.add('hideElement');
            } else {
                aFB.classList.add('hideElement');
                document.getElementsByClassName('refreshFiltersLink')[0].classList.remove('hideElement');
            }
        };


        //Getting all values in start, initialization of filters
        if (!$scope.filters) {
            $scope.filters = changeValues(query);
        }

    }
])
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

        // open/close chosen div
        function hideShowBoxes(currentBox, currentButton, state1, state2){
            currentBox.style.display = state1;
            currentButton.style.display = state2;
        };

        // recoloring checked option
        function checkedFieldColor(currentField, state){
            if (state == 'active'){
                console.log('active');
                currentField.parentNode.classList.remove('sBDCVPassive');
                currentField.parentNode.classList.add('sBDCVActive');
                currentField.parentNode.getElementsByTagName('p')[0].classList.remove('sBDCValuePPassive');
                currentField.parentNode.getElementsByTagName('p')[0].classList.add('sBDCValuePActive');
            }
            else {
                console.log('passive');
                currentField.parentNode.classList.remove('sBDCVActive');
                currentField.parentNode.classList.add('sBDCVPassive');
                currentField.parentNode.getElementsByTagName('p')[0].classList.remove('sBDCValuePActive');
                currentField.parentNode.getElementsByTagName('p')[0].classList.add('sBDCValuePPassive');
            }
        };  

        function clearSearchBox(id){
            if ($scope.searchFilter != undefined) {
                $scope.searchFilter[id] = '';
                console.log('Зачищено ' + $scope.searchFilter, id);
            }
        }


        //filter for matching by the search field
        $scope.searchFilterFunc = (arr, val) => {
            return function(item) {
                if (item[arr].match(val)) return true;
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
                        queryCurrent = [];
                        changeValues(query, eventTarget, keyName);
                    }

                    
                    hideShowBoxes(eventTarget.nextElementSibling, eventTarget, 'none', 'inline-block');

                    document.removeEventListener('click', hideDrop);
                }
            });
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
                            queryCurrent.push(a);
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
            query = {};
            changeValues(query);
        }
 
        $scope.nextPage = () => {
            optionsFilter.sendQueryNextPage(query);
            
                // .then((r) => {
                //     $scope.filters = r;
                // });
        }
        //Getting all values in start, initialization of filters
        if (!$scope.filters) {
            $scope.filters = changeValues(query);
        }

    }
])
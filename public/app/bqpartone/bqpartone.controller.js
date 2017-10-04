'use strict'

angular.module('bqpartone').controller('preResultTable', ['$scope', 'bqpartoneFactory',
    ($scope, bqpartoneFactory) => {
        let getResults = () => {
            bqpartoneFactory.getResultsForTable()
                .then((data)=>{
                    killLoader();
                    $scope.tableContentHeader = data.data[0];
                    $scope.tableContent = data.data;
                    $scope.tableContent.splice(0,1);
                });
        };

        let killLoader = () => {
            document.getElementsByClassName('loaderDiv')[0].innerHTML = '';
        }

            getResults();



    }]);
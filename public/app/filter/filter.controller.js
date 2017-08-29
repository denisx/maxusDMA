'use strict'

angular.module('filter').controller('filterController',['$scope', 'optionsFilter',
        ($scope, optionsFilter) => {
            
            function changeValues(q) {
                optionsFilter.refreshOptions(q)
                    .then( (r) => {
                        $scope.filters = r;
                        console.log('Обновленно');
                    });
                restoreOptions();

            };

            function restoreOptions(){
                for (let k in query){
                    console.log(k, query[k]);
                    
                    document.getElementsByName(k)[0].value = query[k];
                    console.log(document.getElementsByName(k)[0].value)
                }
                console.log(query);
            }

            let query = {};
            if (!$scope.filters) {
                $scope.filters = changeValues(query);
            }
            


            $scope.refresh = (name) => {
                let doc = document.getElementsByName(name)[0].selectedOptions;
                //console.log(doc);
                for (let i = 0; i<doc.length; i++){
                    query[name] = doc[i].value;
                }
                //console.log(query);
                changeValues(query);

                for (let i = 0; i<query.length; i++){
                    // document.getElementsByName('industry')[0].value = 'Industry1'
                }
                //  console.log(document.getElementsByName);
            };

        }
])
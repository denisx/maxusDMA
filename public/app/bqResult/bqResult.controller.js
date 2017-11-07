'use strict'

angular.module('bqResult').controller('resulttable', ['$scope', 'bqResultFactory',
    ($scope, bqResultFactory) => {
        let getResults = () => {
            bqResultFactory.getResultsForQuery()
                .then((data) => {
                    console.log(data);
                });
            return false;
        };
        let getAnswer =  () => {
            bqResultFactory.getAnswerForQuery()
                .then((data) => {
                    console.log(data);
                });
            return false;
        }
        getResults();
        getAnswer();

        let ctx = document.getElementById('myChart').getContext('2d');
        let chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
                labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"],
                datasets: [{
                        label: "Test data",
                        backgroundColor: 'transparent',
                        borderColor: 'rgb(0, 182, 224)',
                        data: [0, 10, 5, 2, 20, 30, 45, 34, 55, 27, 42, 46, 47, 33, 49]
                    },
                    {
                        label: "Test data 2 ",
                        backgroundColor: 'transparent',
                        borderColor: '#e12e31', //'#55b14e',
                        data: [3, 12, 4, 4, 8, 20, 59, 34, 50, 22, 40, 51, 24, 39, 55]
                    }
                ]
            },

            // Configuration options go here
            options: {
                responsive: true,
                responsiveAnimationDuration: 500,
                maintainAspectRatio: false,
                animation: {
                    easing: 'easeOutCirc'
                }
            }
        });
    }
]);
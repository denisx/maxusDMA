angular.module('greeting').controller('greetingController', ['$scope', 'name', function ($scope, name) {
      
    $scope.test = "test1";
    $scope.user = sessionStorage.sessionUser; 

    }])
angular.module('greeting').controller('greetingController',[
        '$scope', 'name', function ($scope, name) {
        if (!sessionStorage.sessionUser) {
            name.then((r)=>{
                $scope.user = r.username;
                sessionStorage.sessionUser = $scope.user;
            })
        }
        else {
            $scope.user = sessionStorage.sessionUser; 
        }
        
        $scope.test = "test1";
        
    }])
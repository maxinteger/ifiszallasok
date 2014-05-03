/**
 * Created by vadasz on 2014.05.02..
 */
Admin = angular.module('IfiszallasokAdmin', ['xeditable']);

Admin.controller('AdminMainCtrl', ['$scope', '$http', function($scope, $http){
    $scope.filter = {};
    $http.get('/api/counties').then(function(result){
        $scope.counties = result.data;
    });

    $scope.editLocation = function(location, county){
        $scope.__originalLocation = location;
        $scope.__originalLocation.__county = county;
        $scope.selectedLocation = _.cloneDeep($scope.__originalLocation);
    };

    $scope.saveLocation = function(){
        if ($scope.__originalLocation.__county.name !== $scope.selectedLocation.__county.name){
            $scope.__originalLocation.__county.locations
        }

    };

    $scope.addContact = function(location){
        if(!location.contacts){
            location.contacts = []
        }
        location.contacts.push({});
    }
}]);
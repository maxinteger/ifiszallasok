/**
 * Created by vadasz on 2014.05.02..
 */
Admin = angular.module('IfiszallasokAdmin', ['ngRoute', 'ngResource', 'xeditable']);

Admin.config([
    '$routeProvider',
    '$locationProvider',
function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: '/templates/admin-main.html',
            controller: 'AdminMainCtrl'
        })
        .when('/location/:id', {
            templateUrl: '/templates/location-edit.html',
            controller: 'LocationEditCtrl'
        })
        .when('/county/:id', {
            templateUrl: '/templates/county-edit.html',
            controller: 'CountyEditCtrl'
        })
        .otherwise('/');

    $locationProvider.html5Mode(false);
}]);

/**
 * Location service
 */
Admin.service('LocationService', ['$resource', function($resource){
    return $resource('/api/location/:id', null, { update: {method: 'PUT' }});
}]);

/**
 * County service
 */
Admin.service('CountyService', ['$resource', function($resource){
    return $resource('/api/county/:id', null, { update: {method: 'PUT' }});
}]);

/**
 * Am
 */
Admin.controller('AdminMainCtrl', [
    '$scope',
    '$http',
function($scope, $http){
    $scope.filter = {};

    function getCounties(){
        $http.get('/api/counties').then(function(result){
            $scope.counties = result.data;
        });
    }
    getCounties();
}]);

/**
 * Location edit page controller
 */
Admin.controller('LocationEditCtrl', [
    '$scope',
    '$routeParams',
    'LocationService',
function($scope, $routeParams, LocationService){
    $scope.locationData = LocationService.get({id: $routeParams.id});

    $scope.addContact = function(location){
        if(!location.contacts){
            location.contacts = []
        }
        location.contacts.push({});
    };
}]);

/**
 * County edit page controller
 */
Admin.controller('CountyEditCtrl', [
    '$scope',
    '$routeParams',
    'CountyService',
function($scope, $routeParams, CountyService){
        $scope.countyData = CountyService.get({id: $routeParams.id});
}]);

/**
 * Map place search directive
 */
Admin.directive('mapPlaceSearch', function(){
    return {
        restrict: 'E',
        require: 'ngModel',
        replace: false,
        template: '<div>' +
            '<input type="text" placeholder="Keresés" class="form-control">' +
            '<div class="map-canvas" style="height: 150px"></div>' +
            '</div>',
        link: function(scope, element, attrs, ngModel){
            var input = element.find('input'),
                searchBox = null,
                map = new google.maps.Map(element.find('.map-canvas')[0], {
                    zoom: 13,
                    center: new google.maps.LatLng(47.0,19.0),
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                }),
                marker = new google.maps.Marker({ map: map });

            scope.data = {};

            ngModel.$render = function modelRender(){
                if (!ngModel.$viewValue){
                    ngModel.$setViewValue({});
                }
                data = ngModel.$viewValue;
                input.val(data.lat + ',' + data.lng);
                initSearchBox();
            };

            function initSearchBox(){
                if (!searchBox){
                    searchBox = new google.maps.places.SearchBox(input[0]);
                    google.maps.event.addListener(searchBox, 'places_changed', searchCallback);
                }
            }

            function searchCallback() {
                if (searchBox.getPlaces()){
                    var place = searchBox.getPlaces()[0];
                    console.log(place);
                    scope.data = {
                        lat: place.geometry.location.k,
                        lng: place.geometry.location.A
                    };
                    updateMarker(place.name, place.geometry.location);
                    ngModel.$setViewValue(scope.data);
                }
            }

            function updateMarker(name, location){
                marker.setTitle(name);
                marker.setPosition(location);
                map.panTo(marker.position);
            }

            scope.$on('$destroy', function(){
                google.maps.event.removeListener(searchBox, 'places_changed');
                marker.setMap(null);
            });
        }
    }
});

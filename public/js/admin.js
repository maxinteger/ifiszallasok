/**
 * Created by vadasz on 2014.05.02..
 */
Admin = angular.module('IfiszallasokAdmin', ['xeditable']);

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
                marker = new google.maps.Marker({
                    map: map
                });

            scope.data = {};

            ngModel.$render = function modelRender(){
                if (!ngModel.$viewValue){
                    ngModel.$setViewValue({});
                }
                data = ngModel.$viewValue;
                input.val(data.lat + ',' + data.lng).focus()
                var e = $.Event("keydown");
                e.keyCode = 13; // # Some key code value
                $(input).trigger(e).blur();
                google.maps.event.trigger(searchBox, 'places_changed');
            };

            searchBox = new google.maps.places.SearchBox(input[0]);
            function searchCallback() {
                if (searchBox.getPlaces()){
                    var place = searchBox.getPlaces()[0];
                    console.log(place);
                    scope.data = {
                        lat: place.geometry.location.k,
                        lng: place.geometry.location.A
                    };

                    marker.setTitle(place.name);
                    marker.setPosition(place.geometry.location);
                    map.panTo(marker.position);
                    scope.$apply(function(){
                    });
                    ngModel.$setViewValue(scope.data);
                }
            }

            google.maps.event.addListener(searchBox, 'places_changed', searchCallback);

            scope.$on('$destroy', function(){
                google.maps.event.removeListener(searchBox, 'places_changed');
                marker.setMap(null);
            });
        }
    }
});

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

    $scope.editLocation = function(location, county){
        $scope.__originalLocation = location;
        $scope.__originalLocation.__county = county;
        $scope.selectedLocation = _.cloneDeep($scope.__originalLocation);
    };

    $scope.saveLocation = function(){

    };

    $scope.addContact = function(location){
        if(!location.contacts){
            location.contacts = []
        }
        location.contacts.push({});
    };

    getCounties();
}]);
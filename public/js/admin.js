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
                marker = null,
                map = new google.maps.Map(element.find('.map-canvas')[0], {
                    zoom: 13,
                    center: new google.maps.LatLng(47.0,19.0),
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });

            scope.data = {};

            ngModel.$render = function modelRender(){
                if (!ngModel.$viewValue){
                    ngModel.$setViewValue({});
                }
                data = ngModel.$viewValue;
                console.log (data)
                input.val(data.lat + ',' + data.lng).focus()
                var e = $.Event("keydown");
                e.keyCode = 13; // # Some key code value
                $(input).trigger(e).blur();
                google.maps.event.trigger(searchBox, 'places_changed');
            };

            searchBox = new google.maps.places.SearchBox(input[0]);
            function searchCallback() {
                if (!searchBox.getPlaces()) return;
                var place = searchBox.getPlaces()[0];
                console.log(place);
                scope.data = {
                    lat: place.geometry.location.k,
                    lng: place.geometry.location.A
                };
                if (marker){
                    marker.setMap(null);
                    marker = null;
                }
                marker = new google.maps.Marker({
                    map: map,
                    title: place.name,
                    position: place.geometry.location
                });
                map.panTo(marker.position);
                scope.$apply(function(){
                });
                ngModel.$setViewValue(scope.data);
            }

            google.maps.event.addListener(searchBox, 'places_changed', searchCallback);

            scope.$on('$destroy', function(){
                google.maps.event.removeListener(searchBox, 'places_changed');
            });

        }
    }
});

Admin.controller('AdminMainCtrl', [
    '$scope',
    '$http',
function($scope, $http){
    $scope.filter = {};
    $http.get('/util/counties').then(function(result){
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
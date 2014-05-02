/**
 * Created by vadasz on 2014.04.25..
 */

var App = angular.module('Ifiszallasok', ['ngSanitize']);

App.directive('map', ['$rootScope', 'CountyService', function($rootScope, CountyService){
    return {
        link: function(scope, element, attrs){
            var mapOptions = {
                    zoom: 7,
                    center: new google.maps.LatLng(47.0,19.0),
                    panControl: true,
                    zoomControl: true,
                    scaleControl: true,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                },

                map = new google.maps.Map(element[0], mapOptions),
                infoWin = new google.maps.InfoWindow({maxWidth: 400});


            function addEvent(target, marker, desc){
                google.maps.event.addListener(target, 'click', function(e) {
                    infoWin.setContent(desc);
                    infoWin.open(map, marker);
                    map.panTo(marker.position);
                });
            }

            function locationInfo(marker, location){
                google.maps.event.addListener(marker, 'click', function(e) {
                    $rootScope.$apply(function(){
                        $rootScope.selectedLocation = location;
                        $('#info-window').modal('show');
                    });
                    map.panTo(marker.position);
                });
            }


            CountyService().then(function(result){
                _.forEach(result.data, function(county){
                    var countyBorder = new google.maps.Polyline({
                        clickable: true,
                        path: _.map(county.coordinates, function(item) {
                            return new google.maps.LatLng(item.lat, item.lng);
                        }),
                        strokeColor: county.style.color || '#FF0000',
                        strokeOpacity: county.style.opacity || 1.0,
                        strokeWeight: county.style.width || 2,
                        map: map
                    });

                    var countyCenter = _.reduce(county.coordinates, function(center, point){
                        center.lat += point.lat;
                        center.lng += point.lng;
                        return center;
                    }, {lat:0, lng:0});

                    var countyMarker = new google.maps.Marker({
                        position: new google.maps.LatLng(countyCenter.lat / county.coordinates.length,
                                                         countyCenter.lng / county.coordinates.length),
                        title: this.name
                    });
                    addEvent(countyBorder, countyMarker, '<h3>' + county.name  + '</h3>');

                    _.forEach(county.locations, function(location){
                        var marker = new google.maps.Marker({
                            position: new google.maps.LatLng(location.coordinate.lat, location.coordinate.lng),
                            title: location.name,
                            map: map
                        });
                        locationInfo(marker, location);
                    });
                });
            }, function(err){
                alert(err);
            });
        }
    }
}]);

App.service('CountyService', ['$http', function($http){
    return function(){
        return $http.get('/api/counties');
    }
}]);

App.controller('mainCtrl', ['$scope', 'CountyService', function($scope, CountyService){
    CountyService().then(function(result){
        $scope.counties = result;
    }, function(err){
        alert(err);
    });

    $scope.openInfoWindow = function(){
    }
}]);
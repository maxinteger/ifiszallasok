/**
 * Created by vadasz on 2014.04.25..
 */

var App = angular.module('Ifiszallasok', ['ngSanitize']),
    gMap = google.maps;

App.directive('map', [
    '$rootScope',
    'CountyService',
function($rootScope, CountyService){
    return {
        link: function(scope, element){
            var markers = {},
                mapOptions = {
                    zoom: 7,
                    center: new gMap.LatLng(47.0,19.0),
                    panControl: true,
                    zoomControl: true,
                    scaleControl: true,
                    mapTypeId: gMap.MapTypeId.ROADMAP
                },

                map = new gMap.Map(element[0], mapOptions),
                infoWin = new gMap.InfoWindow({maxWidth: 400});

            function addEvent(target, marker, desc){
                gMap.event.addListener(target, 'click', function(e) {
                    infoWin.setContent(desc);
                    infoWin.open(map, marker);
                    map.panTo(marker.position);
                });
            }

            function locationInfo(marker, location){
                gMap.event.addListener(marker, 'click', function(e) {
                    $rootScope.$apply(function(){
                        $rootScope.selectedLocation = location;
                        $('#info-window').modal('show');
                    });
                    map.panTo(marker.position);
                });
            }

            scope.$watch('filter.location', function(val){
                var filterVal = (val || '').toLowerCase();
                _.forEach(markers, function(value, key){
                    value.setVisible(key.toLowerCase().indexOf(filterVal) > -1);
                });
            });

            CountyService().then(function(result){
                _.forEach(result.data, function(county){
                    var countyBorder = new gMap.Polyline({
                        clickable: true,
                        path: _.map(county.coordinates, function(item) {
                            return new gMap.LatLng(item.lat, item.lng);
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

                    var countyMarker = new gMap.Marker({
                        position: new gMap.LatLng(countyCenter.lat / county.coordinates.length,
                                                         countyCenter.lng / county.coordinates.length),
                        title: this.name
                    });
                    addEvent(countyBorder, countyMarker, '<h3>' + county.name  + '</h3>');

                    _.forEach(county.locations, function(location){
                        var marker = new gMap.Marker({
                            position: new gMap.LatLng(location.coordinate.lat, location.coordinate.lng),
                            title: location.name,
                            map: map
                        });
                        markers[location.name] = marker;
                        locationInfo(marker, location);
                    });
                });
            }, function(err){
                console.error(err);
            });
        }
    }
}]);

App.service('CountyService', ['$http', function($http){
    return function(){
        return $http.get('/api/counties');
    }
}]);

App.controller('mainCtrl', [
    '$rootScope',
    '$scope',
    'CountyService',
function($rootScope, $scope, CountyService){
    $scope.filter = {};
    CountyService().then(function(result){
        $scope.counties = _.map(_.sortBy(result.data, 'name'), function(county){
            county.locations = _.sortBy(county.locations || [], 'name');
            return county;
        });
    }, function(err){
        console.error(err);
    });

    $scope.openInfoWindow = function(location){
        $rootScope.selectedLocation = location;
        $('#info-window').modal('show');
    };

    contactTypes = {
        mobil: 'glyphicon-phone',
        phone: 'glyphicon-phone-alt',
        mail: 'glyphicon-envelope'
    };
    $scope.getContactTypeClass = function(contact){
        return contactTypes[contact.type] || 'glyphicon-question-sign';
    };
}]);
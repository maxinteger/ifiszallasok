/**
 * Created by vadasz on 2014.04.25..
 */

    //+ Jonas Raoni Soares Silva
    //@ http://jsfromhell.com/math/is-point-in-poly [rev. #0]

function isPointInPoly(poly, pt){
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
        && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
        && (c = !c);
    return c;
}

var KML_URL = "http://pipes.yahoo.com/pipes/pipe.run?_id=54b2cac8daccd0be70a9516f6fce5d61&_render=json&_callback=loadKML",
    infoWin = new google.maps.InfoWindow({maxWidth: 400}),
    map = null;

function loadScript(filename){
    var fileref=document.createElement('script')
    fileref.setAttribute("type","text/javascript")
    fileref.setAttribute("src", filename)
    document.getElementsByTagName("head")[0].appendChild(fileref)
}

function initializeMap() {
    var mapCood = new google.maps.LatLng(47.0,19.0);
    var mapOptions = {
        zoom: 7,
        center: mapCood,
        panControl: true,
        zoomControl: true,
        scaleControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    /*
     var kmlLayer = new google.maps.KmlLayer({
     url: KML_URL,
     suppressInfoWindows: true,
     map: map
     });
     */
    return map;
}

var loadKML = function( data){
    $mlist = $("#marker-list")
    $mlist.on('click', 'li.location', function(e){
        if (!$(e.target).is('.zoom')){
            var marker = $(this).data('marker');
            google.maps.event.trigger(marker, 'click')
        }
    }).on('click', 'a.zoom', function (e) {
        e.preventDefault()
        $(this).closest('.location').click()
        map.setZoom(15);
    }).on ('mouseover', 'li.location', function(){
        var marker = $(this).data('marker'),
            icon = marker.getIcon();
        marker.setAnimation(google.maps.Animation.DROP)
        marker.setIcon(null)
        $(this).one('mouseout', function(){
            if(map.getZoom() > 10){
                marker.setAnimation(null)
            }
            marker.setIcon(icon)
        })
    })


    function addEvent(marker, desc){
        google.maps.event.addListener(marker, 'click', function(e) {
            infoWin.setContent(desc)
            infoWin.open(map, marker)
            //map.setZoom(15);
            map.panTo(marker.position);
        });
    }

    data = data.value.items[0].Document

    var boundList = [], styles = {}

    $.each(data.Style, function(){
        var id = '#' + this.id;
        if (this.LineStyle){
            var color = this.LineStyle.color.match(/.{2}/g);
            styles[id] = {
                lineWidth: this.LineStyle.width,
                lineColor: color && "#" + color.splice(1).reverse().join('') || '',
                lineOpacity: color && (parseInt(color[0],16) / 256) || ''
            }
        }
        else if (this.IconStyle){
            styles[id] = { icon : this.IconStyle.Icon.href }
        }
    });

    var areas = {},
        points = [];

    $.each(data.Placemark, function(index, value){
        if (this.Point){
            points.push(this)
        } else if (this.LineString){
            var coords = this.LineString.coordinates.match(/([0-9.,]+)/g),
                list = [],
                s = styles[this.styleUrl] || {},
                areaCoords = [],
                middle = null
            for (var c=null, x=0, y=0, i = 0, len = coords.length; i < len; i++){
                c = coords[i].split(',');
                x = parseFloat(c[1]);
                y = parseFloat(c[0]);
                areaCoords.push({x: x, y: y});
                if (middle !== null){
                    middle.x += x
                    middle.y += y
                } else middle = {x: x, y:y}
                list.push(new google.maps.LatLng(x, y));
            }
            areas[this.name] = areaCoords
            var flightPath = new google.maps.Polyline({
                clickable: true,
                path: list,
                strokeColor: s.lineColor || '#FF0000',
                strokeOpacity: s.lineOpacity || 1.0,
                strokeWeight: s.lineWidth || 2,
                map: map
            });

            var areaMarker = new google.maps.Marker({
                position: new google.maps.LatLng(middle.x / list.length, middle.y / list.length),
                title: this.name
            });
            google.maps.event.addListener(flightPath, 'click', function(e) {
                infoWin.setContent("<h3>" + areaMarker.title + "</h3>")
                infoWin.open(map,areaMarker)
                map.panTo(areaMarker.position);
            });
            boundList = boundList.concat(list)
        }
    })
    var pointCat = {}
    $.each(points, function(idx, val){
        var coords = this.Point.coordinates.split(','),
            x = parseFloat(coords[1]),
            y = parseFloat(coords[0]),
            pos = new google.maps.LatLng(x, y),
            marker = new google.maps.Marker({
                position: pos,
                map: map,
                title: this.name
            });
        if (styles[this.styleUrl]){
            marker.setIcon(styles[this.styleUrl].icon)
        }
        addEvent(marker, "<h3>" + this.name + "</h3>" + this.description)
        var $marker = $('<li class="location"><span class="name">'+this.name+'</span><a href="#" class="zoom">[Nagyítás]</a></li>').data('marker', marker)
        boundList.push(pos)
        for (var areaName in areas){
            if (isPointInPoly(areas[areaName], {x:x, y:y})){
                if (!pointCat[areaName]) pointCat[areaName] = []
                pointCat[areaName].push($marker)
            }
        }
    })
    areas = null

    $.each(pointCat, function(name, arr){
        var cat = $('<li><div class="group-title">'+name+'</div><ul class="places-list"></ul></li>').appendTo($mlist).find('ul');
        for (var i = 0, l = arr.length; i < l; i++) arr[i].appendTo(cat);
    });

    var bounds = new google.maps.LatLngBounds (),
        len = boundList.length;
    while (len --) bounds.extend(boundList[len])

    $fitBtn = $('<div class="fit-btn">Térkép igazítása</div>').on('click', function(){ map.fitBounds (bounds); }).click()
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push($fitBtn.get(0))

}

google.maps.event.addDomListener(window, 'load', function(){
    initializeMap()
    loadScript(KML_URL)
})

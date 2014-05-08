var mongoose = require('mongoose'),
    request = require("request"),
    _ = require('lodash'),

    models = require('./server/models'),

    url = 'http://pipes.yahoo.com/pipes/pipe.run?_id=54b2cac8daccd0be70a9516f6fce5d61&_render=json',
    json = null,
    dbURL = 'mongodb://localhost:27017/ifiszallasok';

if(process.env.OPENSHIFT_MONGODB_DB_URL){
    dbURL = process.env.OPENSHIFT_MONGODB_DB_URL + 'admin';
}
mongoose.connect(dbURL);
var db = mongoose.connection;

request({url: url, json: true}, function(err, resp, body){
    var json = body.value.items[0].Document,
        styles = {},
        counties = [];

    /**
     * Parse Styles
     */
    _.map(json.Style, function(style){
        styles[style.id] = style.LineStyle || {};
    });

    /**
     * Parse Counties
     */
    _.map(json.Placemark, function(item){
        if(item.LineString){
            var coors = item.LineString.coordinates.match(/([0-9.,]+)/g),
                style = styles[item.styleUrl.substr(1)] || {color: '00000000', width: 1},
                color = style.color.match(/.{2}/g);

            console.log(item.name);
            var county = new models.County({
                name: item.name,
                description: item.description,
                style: {
                    width: parseFloat(style.width) || 1,
                    color: color && "#" + color.splice(1).reverse().join('') || '',
                    opacity: color && (parseInt(color[0],16) / 256) || 1
                },
                coordinates: _.map(coors, function(coord){
                    coord = coord.split(',');
                    return {
                        lat: parseFloat(coord[1]),
                        lng: parseFloat(coord[0])
                    }
                })
            });
            counties.push(county);
            county.save();
        }
    });

    /**
     * Parse Locations
     */
    _.map(json.Placemark, function(item){
        if(item.Point){
            var coors = item.Point.coordinates.split(','),
                coord = {
                    lat: parseFloat(coors[1]),
                    lng: parseFloat(coors[0])
                },

                county = (_.filter(counties, function(county){
                        return county.contain(coord);
                    })[0] || {});

            new models.Location({
                name: item.name,
                county_id: county.id,
                coordinate: coord,
                description: item.description
            }).save();
        }
    });
});
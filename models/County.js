/**
 * Created by vadasz on 2014.04.26..
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Utils = require('../common/utils');

exports.CountySchema = new Schema({
    name:  String,
    coordinates: [{
        _id: false,
        lat: Number,
        lng: Number
    }],
    description: String,
    style: {
        width: Number,
        color: String,
        opacity: Number
    }
});

exports.CountySchema.methods.test= function (location) {
    console.log(this);
    console.log(this.name);
};
exports.CountySchema.methods.contain = function (location) {
    return Utils.isPointInPoly(this.coordinates, location, function(coord){
        return [coord.lat, coord.lng];
    });
};

exports.County = mongoose.model('County', exports.CountySchema);


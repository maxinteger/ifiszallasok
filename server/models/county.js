/**
 * Created by vadasz on 2014.04.26..
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Utils = require('../../common/utils');

var locationSchema = new Schema({
    name:  String,
    coordinate: {lat: Number, lng: Number},
    description: String,
    manager: String,
    address: String,
    contacts: [{
        _id: false,
        type: String,
        name: String,
        value: String
    }]
});

var countySchema = new Schema({
    name:  String,
    coordinates: [{
        _id: false,
        lat: Number,
        lng: Number
    }],
    locations:[locationSchema],
    description: String,
    style: {
        width: Number,
        color: String,
        opacity: Number
    }
});

countySchema.methods.contain = function (location) {
    return Utils.isPointInPoly(this.coordinates, location, function(coord){
        return [coord.lat, coord.lng];
    });
};

exports.County = mongoose.model('County', countySchema);


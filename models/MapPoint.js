var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

exports.MapPointSchema = new Schema({
    name:  String,
    coordinate: {lat: Number, lng: Number},
    description: String,
    manager: String,
    address: String,
    web: String,
    email: String,
    phone: String
});

exports.MapPoint = mongoose.model('MapPoint', exports.MapPointSchema)


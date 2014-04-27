var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

exports.LocationSchema = new Schema({
    name:  String,
    coordinate: {lat: Number, lng: Number},
    description: String,
    county: String,
    manager: String,
    address: String,
    web: String,
    email: String,
    phone: String
});

exports.Location = mongoose.model('Location', exports.LocationSchema)


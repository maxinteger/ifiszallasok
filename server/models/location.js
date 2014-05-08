/**
 * Created by vadasz on 2014.05.07..
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var locationSchema = new Schema({
    name:  String,
    county_id: String,
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

exports.Location = mongoose.model('Location', locationSchema);
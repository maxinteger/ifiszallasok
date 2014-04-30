/**
 * Created by vadasz on 2014.04.30..
 */
var Location = require('../models/location').Location;

exports.location = function(req, res){
    Location.find({}, function(error, data){
        res.json(data);
    });
};
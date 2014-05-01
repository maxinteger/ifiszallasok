/**
 * Created by vadasz on 2014.04.30..
 */
var County = require('../models/county').County;

exports.county = function(req, res){
    County.find({}, function(error, data){
        res.json(data);
    });
};
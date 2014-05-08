/**
 * Created by vadasz on 2014.04.30..
 */
var models = require('../models'),
    middleware  = require('../middleware');

exports.county2 = function(req, res){
    models.County.find({}, function(error, counties){
        models.Location.find({}, function(err, locations){
            var groupedLocations = _.groupBy(locations, 'county_id');
            _.forEach(counties, function(county){
                county.locations = groupedLocations[county._id];
            });
            res.json(counties);
        });
    });
};

exports.county = function(express, url){
    express.get('/api/counties', function(req, res){
        models.County.find({}, function(error, counties) {
            res.json(counties);
        });
    });

    express.get('/api/county/:id', function(req, res){
        models.County.findOne({ _id: req.params.id }, function (err, data) {
            res.json(data);
        });
    });

    express.post('/api/county/:id', middleware.checkAuth, function(req, res){
        models.County(req.params).save(function(err, data){
            res.json(data);
        });
    });

    express.delete('/api/county/:id', middleware.checkAuth, function(req, res){
        models.County.findOneAndRemove({ _id: req.params.id }, function(){
            res.json(data);
        });
    })
};
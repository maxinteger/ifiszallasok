/**
 * Created by vadasz on 2014.05.09..
 */
var _ = require('lodash'),
    models = require('../models');
    
exports.countiesAndLocations = function(req, res){
    models.County.find(function(error, counties){
        models.Location.find(function(err, locations){
            var groupedLocations = _.groupBy(locations, 'county_id');
            res.json(_.map(counties, function(county){
                var c = county.toJSON();
                c.locations = groupedLocations[county._id];
                return c;
            }).concat({
                name: 'undefined',
                locations: groupedLocations[void 0]
            }));
        });
    });
};
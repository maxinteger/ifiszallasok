/**
 * Created by vadasz on 2014.04.30..
 */
var _ = require('lodash'),
    middleware  = require('../middleware');

exports.createEndpoint = function(express, model){
    var name = model.modelName.toLowerCase(),
        modelKeys = _.filter(Object.keys(model.schema.tree), function(item){return item !== '_id' }),
        listUrl = '/api/' + name,
        itemUrl = listUrl + '/:id';

    function handleResult (res){
        return function (err, data){
            res.json(data);
        }
    }
    function filterData(params, keepId){
        return _.pick(params, keepId ? modelKeys.concat('_id') : modelKeys);
    }

    express.get(listUrl, function(req, res){
        model.find({}, handleResult(res));
    });

    express.get(itemUrl, function(req, res){
        model.findOne({ _id: req.params.id }, handleResult(res));
    });

    express.post(listUrl, middleware.checkAuth, function(req, res){
        new model(filterData(req.body)).save(handleResult(res));
    });

    express.put(itemUrl, function(req, res){
        model.findByIdAndUpdate(req.params.id, filterData(req.body), { multi: false }, handleResult(res) );
    });

    express.delete(itemUrl, middleware.checkAuth, function(req, res){
        model.findOneAndRemove({ _id: req.params.id }, handleResult(res));
    });
};
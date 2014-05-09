/**
 * Created by vadasz on 2014.04.30..
 */
var _ = require('lodash'),
    middleware  = require('../middleware');

exports.createEndpoint = function(express, model){
    var name = model.modelName.toLowerCase(),
        modelKeys = Object.keys(model.schema.tree),
        listUrl = '/api/' + name,
        itemUrl = listUrl + '/:id';

    function handleResult (res){
        return function (err, data){
            res.json(data);
        }
    }

    express.get(listUrl, function(req, res){
        model.find({}, handleResult(res));
    });

    express.get(itemUrl, function(req, res){
        model.findOne({ _id: req.params.id }, handleResult(res));
    });

    express.post(itemUrl, middleware.checkAuth, function(req, res){
        new model(req.params).save(handleResult(res));
    });

    express.put(itemUrl, function(req, res){
        model.update({ _id: req.params.id },_.pick(req.params, modelKeys), { multi: false }, handleResult(res) );
    });

    express.delete(itemUrl, middleware.checkAuth, function(req, res){
        model.findOneAndRemove({ _id: req.params.id }, handleResult(res));
    });
};
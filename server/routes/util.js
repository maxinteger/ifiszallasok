/**
 * Created by vadasz on 2014.04.30..
 */
var _ = require('lodash'),
    events = require('events'),
    middleware  = require('../middleware');

exports.createEndpoint = function(express, model){
    var name = model.modelName.toLowerCase(),
        modelKeys = _.filter(Object.keys(model.schema.tree), function(item){return item !== '_id' }),
        listUrl = '/api/' + name,
        itemUrl = listUrl + '/:id',
        emitter = new events.EventEmitter();

    function handleResult (type, res, data){
        return function (err, data){
            if (err){
                console.error(err);
                emitter.emit('error', type, data);
            } else {
                res.json(data);
                emitter.emit(type, data);
            }
        }
    }
    function filterData(params, keepId){
        return _.pick(params, keepId ? modelKeys.concat('_id') : modelKeys);
    }

    express.get(listUrl, function(req, res){
        model.find({}, handleResult('query', res, {}));
    });

    express.get(itemUrl, function(req, res){
        model.findOne({ _id: req.params.id }, handleResult('get', res, { _id: req.params.id }));
    });

    express.post(listUrl, middleware.checkAuth, function(req, res){
        new model(filterData(req.body)).save(handleResult('post', res, req.data));
    });

    express.put(itemUrl, function(req, res){
        model.findByIdAndUpdate(req.params.id, filterData(req.body), { multi: false }, handleResult('put', res, req.body) );
    });

    express.delete(itemUrl, middleware.checkAuth, function(req, res){
        model.findOneAndRemove({ _id: req.params.id }, handleResult('delete', res, { _id: req.params.id }));
    });

    return emitter;
};
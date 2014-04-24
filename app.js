#!/bin/env node
/**
 * Module dependencies.
 */

var express = require('express'),
    routes  = require('./routes'),
    user    = require('./routes/user'),
    http    = require('http'),
    path    = require('path'),
    fs      = require('fs'),
    mongodb = require('mongodb'),
    mongoose = require('mongoose');

var app = express();


/**

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

*/


var App = function(){

    // Scope
    var self = this;

    // Setup
    self.dbHost = process.env.OPENSHIFT_MONGODB_DB_HOST || 'localhost';
    self.dbPort = parseInt(process.env.OPENSHIFT_MONGODB_DB_PORT || 27017);
    self.dbName = 'ifiszallas';
    //self.db = new mongodb.Db('nodews', self.dbServer, {auto_reconnect: true});
    self.dbUser = process.env.OPENSHIFT_MONGODB_DB_USERNAME || '';
    self.dbPass = process.env.OPENSHIFT_MONGODB_DB_PASSWORD || '';

    self.ipaddr  = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
    self.port    = parseInt(process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT) || 3000;
    if (typeof self.ipaddr === "undefined") {
        console.warn('No OPENSHIFT_NODEJS_IP environment variable');
    };


    // Web app urls

    self.app  = express();

    // all environments
    self.app.set('port', self.port);
    self.app.set('views', path.join(__dirname, 'views'));
    self.app.set('view engine', 'jade');
    self.app.use(express.favicon());
    self.app.use(express.logger('dev'));
    self.app.use(express.json());
    self.app.use(express.urlencoded());
    self.app.use(express.methodOverride());
    self.app.use(express.cookieParser('your secret here'));
    self.app.use(express.session());
    self.app.use(self.app.router);
    self.app.use(express.static(path.join(__dirname, 'public')));

    // development only
    if ('development' == self.app.get('env')) {
        self.app.use(express.errorHandler());
    }

    self.app.get('/', routes.index);
    self.app.get('/users', user.list);


    // Logic to open a database connection. We are going to call this outside of app so it is available to all our functions inside.

    self.connectDb = function(callback){
        var dbAuth = '';
        if (self.dbUser){
            dbAuth = self.dbUser + ':' + self.dbPass + '@'
        }
        mongoose.connect('mongodb://' + dbAuth + self.dbHost + ':' + self.dbPort +  '/' + self.dbName);
        self.db = mongoose.connection;
        self.db.once('open', callback);
    };


    //starting the nodejs server with express
    self.startServer = function(){
        self.app.listen(self.port, self.ipaddr, function(){
            console.log('%s: Node server started on %s:%d ...', Date(Date.now()), self.ipaddr, self.port);
        });
    }

    // Destructors
    self.terminator = function(sig) {
        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating Node server ...', Date(Date.now()), sig);
            process.exit(1);
        };
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };

    process.on('exit', function() { self.terminator(); });

    self.terminatorSetup = function(element, index, array) {
        process.on(element, function() { self.terminator(element); });
    };

    ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGTERM'].forEach(self.terminatorSetup);

};

//make a new express app
var app = new App();

//call the connectDb function and pass in the start server command
app.connectDb(app.startServer);
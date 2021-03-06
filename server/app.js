#!/bin/env node
/**
 * Module dependencies.
 */
var DEBUG       = process.env.DEBUG;

var express     = require('express'),
    path        = require('path'),
    mongoose    = require('mongoose'),
    passport    = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    flash       = require('connect-flash'),

    models      = require('./models'),
    routes      = require('./routes'),
    middleware  = require('./middleware'),
    User        = require('./models/user').User;


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});


// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        user.comparePassword(password, function(err, isMatch) {
            if (err) return done(err);
            if(isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Invalid password' });
            }
        });
    });
}));


var App = function(){

    // Scope
    var self = this;

    // Setup
    self.dbURL = 'mongodb://localhost:27017/ifiszallasok';
    if(process.env.OPENSHIFT_MONGODB_DB_URL){
        self.dbURL = process.env.OPENSHIFT_MONGODB_DB_URL + 'admin';
    }
    self.ipaddr  = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
    self.port    = parseInt(process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT) || 3000;

    self.app  = express();

    // development only
    if ('development' == self.app.get('env')) {
        self.app.use(express.errorHandler());
    }

    // all environments
    self.app.set('port', self.port);
    self.app.set('views', path.join(__dirname, 'views'));
    self.app.set('view engine', 'jade');
    //self.app.use(express.favicon());
    self.app.locals({
        DEBUG: DEBUG
    });
    self.app.use(express.logger('dev'));
    self.app.use(express.json());
    self.app.use(express.urlencoded());
    self.app.use(express.methodOverride());
    self.app.use(express.cookieParser('your secret here'));
    self.app.use(express.session({ secret: process.env.APP_SECRET }));
    self.app.use(passport.initialize());
    self.app.use(passport.session());
    self.app.use(flash());
    self.app.use(self.app.router);
    self.app.use(express.static(path.join(__dirname, '../public')));

    // Web app urls
    self.app.post('/singin',
        passport.authenticate('local', {
            successRedirect: '/admin',
            failureRedirect: '/singin',
            failureFlash: true
        })
    );

    self.app.post('/singup', function(req, res){
        var username = req.param('username'),
            pw1 = req.param('password'),
            pw2 = req.param('password-again');

        User.findOne({ username: username }, function(err, user){
            if (user.length === 0){
                if (pw1.trim() === '' || pw1 !== pw2){
                    req.flash('error', 'Invalid password');
                    res.redirect('/singup');
                } else {
                    new User({
                        username: username,
                        password: pw1,
                        admin: false
                    }).save();
                    res.redirect('/');
                }
            }
        })
    });


    self.app.get('/', routes.index);
    self.app.get('/admin', middleware.checkAuth, routes.admin);

    self.app.get('/singin', function(req, res){
        res.render('auth/singin', { layout:'auth', user: req.user, message: req.session.messages });
    });

    self.app.get('/singup', function(req, res){
        res.render('auth/singup', { layout:'auth', user: req.user, message: req.session.messages });
    });

    self.app.get('/singout', function(req, res){
        req.logout();
        res.redirect('/');
    });

    // API
    routes.util.createEndpoint(self.app, models.County).on('delete', function(data){
        Location.update({county_id: data._id}, {county_id: void 0}, {multi: true})
    });
    routes.util.createEndpoint(self.app, models.Location);

    self.app.get('/api/counties', routes.api.countiesAndLocations);

    // Otherwise
    self.app.use(function(req, res){
        res.render('404', {});
    });


    // Logic to open a database connection. We are going to call this outside of app so it is available to all our functions inside.

    self.connectDb = function(callback){
        mongoose.connect(self.dbURL);
        self.db = mongoose.connection;
        self.db.once('open', callback);
    };


    //starting the nodejs server with express
    self.startServer = function(){
        self.app.listen(self.port, self.ipaddr, function(){
            console.log('%s: Node server started on %s:%d ...', new Date(Date.now()), self.ipaddr, self.port);
        });
    };

    // Destructors
    self.terminator = function(sig) {
        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating Node server ...', new Date(Date.now()), sig);
            process.exit(1);
        }
        console.log('%s: Node server stopped.', new Date(Date.now()) );
    };

    process.on('exit', function() { self.terminator(); });

    self.terminatorSetup = function(element) {
        process.on(element, function() { self.terminator(element); });
    };

    ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGTERM'].forEach(self.terminatorSetup);
};

//make a new express app
var app = new App();

//call the connectDb function and pass in the start server command
app.connectDb(app.startServer);
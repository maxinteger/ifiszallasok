/**
 * Created by vadasz on 2014.04.27..
 */

exports.ensureAuthenticated = function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/singin')
}
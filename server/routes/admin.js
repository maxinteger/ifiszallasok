
/*
 * GET admin page.
 */

exports.admin = function(req, res){
    res.render('admin/admin', { layout: 'admin' });
};
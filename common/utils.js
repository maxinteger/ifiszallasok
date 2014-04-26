/**
 * Created by vadasz on 2014.04.26..
 */
/**
 *
 * Jonas Raoni Soares Silva
 * http://jsfromhell.com/math/is-point-in-poly [rev. #0]
 *
 * @param poly              polygon points
 * @param pt                point
 * @param {function} [fn]   convert function default: c => [c.x, c.y]
 * @returns {boolean}       true if 'pt' in 'poly' else false
 */
exports.isPointInPoly = function (poly, pt, fn){
    fn = fn || function(point){
        return [point.x, point.y];
    };
    pt = fn(pt);
    var ptx = pt[0],
        pty = pt[1];

    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i){
        var p1 = fn(poly[i]),
            p2 = fn(poly[j]);
        ( (p1[1] <= pty && pty < p2[1]) || (p2[1] <= pty && pty < p1[1]) ) &&
        ( ptx < (p2[0] - p1[0]) * (pty - p1[1]) / (p2[1] - p1[1]) + p1[0] ) &&
        ( c = !c );
    }
    return c;
};
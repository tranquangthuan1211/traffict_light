var log4js = require('log4js');
var logger = log4js.getLogger('middleware.intersection');
var jwt = require('../helper/jwt');
var key = require('../helper/key');
var tokenModel = require('../models/token.model');

module.exports = {
    intersectionMiddleware: async function(req, res, next) {
        tokenModel
        .findOne({ token: req.get('access-token') })
        .then(function(data) {
            if (data) {
                try {
                    var decoded = await jwt.verifyToken(
                        req.get('access-token'), key.secretKeyForIntersection);
                    logger.info('Verify token success');
                    res.locals.id = decoded.data.id;
                    res.locals.intersectionName = decoded.data.intersectionName;
                    next();
                }
                catch(error) {
                    logger.error('Invalid token, error: %s', error);
                    return res
                    .status(401)
                    .json({ message: 'Unauthorized'});
                }
            }
            else {
                logger.error('Invalid token');
                return res
                .status(401)
                .json({ message: 'Unauthorized'});
            }
        })
        .catch(function(error) {
            logger.error('Error: %s', error);
            return res
            .status(501)
            .json({ message: 'Error'});
        })
    },
}
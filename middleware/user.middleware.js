var log4js = require('log4js');
var logger = log4js.getLogger('middleware.user');
var jwt = require('../helper/jwt');
var key = require('../helper/key');
var refreshTokenHelper = require('../middleware/refreshAccessToken');

module.exports = {
    userMiddleware: async function(req, res, next) {
        if (req.cookies.accessToken) {
            try {
                var decoded = await jwt.verifyToken(req.cookies.accessToken, key.secretKeyForCenter);
                logger.info('Verify token success');
                res.locals.id = decoded.data.id;
                res.locals.name = decoded.data.name;
                next();
            }
            catch(error) {
                if (error.name === 'TokenExpiredError') {
                    logger.info('refresh accessToken');
                    refreshTokenHelper.user(req, res, next);
                }
                else {
                    logger.error('Invalid token, error: %s', error);
                    return res
                    .status(304)
                    .redirect('/center-control/login');
                }
            }
        }
        else {
            logger.warn('No token provided');
            return res
            .status(304)
            .redirect('/center-control/login');
        }
    }
}
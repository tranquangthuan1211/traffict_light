var log4js = require('log4js');
var logger = log4js.getLogger('middleware.vehicle');
var jwt = require('../helper/jwt');
var key = require('../helper/key');
var refreshTokenHelper = require('../middleware/refreshAccessToken');

module.exports = {
    vehicleMiddleware: async function(req, res, next) {
        if (req.cookies.accessToken) {
            try {
                var decoded = await jwt.verifyToken(req.cookies.accessToken, key.secretKeyForVehicle);
                logger.info('Verify token success');
                res.locals.id = decoded.data.id;
                res.locals.license_plate = decoded.data.license_plate;
                next();
            }
            catch(error) {
                if (error.name === 'TokenExpiredError') {
                    logger.info('refresh accessToken');
                    refreshTokenHelper.vehicle(req, res, next);
                }
                else {
                    logger.error('Invalid token, error: %s', error);
                    return res
                    .status(304)
                    .redirect('/vehicle/login');
                }
            }
        }
        else {
            logger.warn('No token provided');
            return res
            .status(304)
            .redirect('/vehicle/login');
        }
    }
}
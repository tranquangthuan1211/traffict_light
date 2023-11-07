var log4js = require('log4js');
var logger = log4js.getLogger('middleware.refreshAccessToken');
var jwtHelper = require('../helper/jwt');
var key = require('../helper/key');
var tokenModel = require('../models/token.model');

module.exports = {
    user: function(req, res, next) {
        tokenModel
        .findOne({ refreshToken: req.cookies.refreshToken })
        .then(async function(data) {
            if(data) {
                try {
                    var decoded = await jwtHelper.verifyToken(req.cookies.refreshToken, key.refreshSecretKeyForCenter);
                    var accessToken =  await jwtHelper.generateToken({ data: decoded.data }, key.secretKeyForCenter, key.tokenLife);
                    
                    logger.info('Refresh access token for user id: %s', decoded.data.id);
                    res
                    .status(200)
                    .cookie('accessToken', accessToken);

                    next();
                }
                catch(error) {
                    logger.error('Refresh accessToken error: %s', error);
                    return res
                    .status(501)
                    .render('error/index.pug', {
                        code: 501,
                        message: 'Not Implemented'
                    });
                };
            }
            else {
                logger.warn('Invalid refresh token');
                return res
                .status(304)
                .redirect('/login')
            };
        })
        .catch(function(error) {
            logger.error('Refresh token error %s', error);
            return res
            .status(501)
            .render('error/index.pug', {
                code: 501,
                message: 'Not Implemented'
            });
        });
    },

    vehicle: function(req, res, next) {
        tokenModel
        .findOne({ refreshToken: req.cookies.refreshToken })
        .then(async function(data) {
            if(data) {
                try {
                    var decoded = await jwtHelper.verifyToken(req.cookies.refreshToken, key.refreshSecretKeyForVehicle);
                    var accessToken =  await jwtHelper.generateToken({ data: decoded.data }, key.secretKeyForVehicle, key.tokenLife);
                    
                    logger.info('Refresh access token for vehicle id: %s', decoded.data.id);
                    res
                    .status(200)
                    .cookie('accessToken', accessToken);

                    next();
                }
                catch(error) {
                    logger.error('Refresh accessToken error: %s', error);
                    return res
                    .status(501)
                    .render('error/index.pug', {
                        code: 501,
                        message: 'Not Implemented'
                    });
                };
            }
            else {
                logger.warn('Invalid refresh token');
                return res
                .status(304)
                .redirect('/vehicle/login');
            };
        })
        .catch(function(error) {
            logger.error('Refresh token error %s', error);
            return res
            .status(501)
            .render('error/index.pug', {
                code: 501,
                message: 'Not Implemented'
            });
        });
    },
}
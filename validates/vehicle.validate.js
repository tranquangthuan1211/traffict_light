var bcrypt = require('bcryptjs');
var log4js = require('log4js');
var logger = log4js.getLogger('validates.vehicle');
var vehicleModel = require('../models/vehicle.model');
var tokenModel = require('../models/token.model');
var jwtHelper = require('../helper/jwt');
var key = require('../helper/key');

module.exports = {
    vehicleValidate: function(req, res) {
        vehicleModel
        .findOneAndUpdate({ license_plate: req.body.license_plate }, { $set: { status: 'online' }})
        .select('license_plate password vehicleType')
        .then(function(data) {
            if (data) {
                if (bcrypt.compareSync(req.body.password, data.password)) {
                    var vehicle = {
                        id: data._id,
                        name: data.license_plate
                    };
    
                    Promise
                    .all([jwtHelper.generateToken({ data:vehicle }, key.secretKeyForVehicle, key.tokenLife), 
                    jwtHelper.generateToken({ data: vehicle }, key.refreshSecretKeyForVehicle, key.refreshTokenLife)])
                    .then(function(token) {
                        logger.info('Auth success, id: %s', data._id);
                        tokenModel.create({
                            userId: data._id,
                            refreshToken: token[1],
                        });
                        
                        return res
                        .status(304)
                        .cookie('accessToken', token[0])
                        .cookie('refreshToken', token[1], { maxAge: 3600000 * 24 * 3650 })
                        .cookie('vehicleId', String(data._id))
                        .cookie('vehicleType', data.vehicleType)
                        .cookie('mapToken', key.mapToken)
                        .cookie('initialLocation', key.initialLocation)
                        .redirect('/vehicle/test-selection');
                    })
                    .catch(function(error) {
                        logger.error('Generate accessToken error, id: %s, error: %s', data._id, error);
                        return res
                        .status(501)
                        .render('error/index.pug', {
                            code: 501,
                            message: 'Not Implemented'
                        });
                    });
                }
                else {
                    logger.warn('Auth fail, vehicle: %s', req.body.license_plate);
                    return res
                    .status(200)
                    .render('login/vehicle.pug', {
                        error: true,
                        values: req.body
                    });
                }
            }
            else {
                logger.warn('Auth fail, vehicle: %s', req.body.license_plate);
                return res
                .status(200)
                .render('login/vehicle.pug', {
                    error: true,
                    values: req.body
                });
            }
        })
        .catch(function(error) {
            logger.error('Auth error, vehicle: %s, error: %s', req.body.vehicle, error);
            return res
            .status(200)
            .render('login/vehicle.pug', {
                error: true,
                values: req.body
            });
        })
    }
}
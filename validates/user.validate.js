var bcrypt = require('bcryptjs');
var log4js = require('log4js');
var logger = log4js.getLogger('validates.user');
var userModel = require('../models/user.model');
var tokenModel = require('../models/token.model');
var jwtHelper = require('../helper/jwt');
var key = require('../helper/key');

module.exports = {
    userValidate: function(req, res) {
        userModel
        .findOneAndUpdate({ username: req.body.username }, { $set: { status: 'online' }})
        .select('firstname password admin')
        .then(function(data) {
            if (bcrypt.compareSync(req.body.password, data.password)) {
                var user = {
                    id: data._id,
                    name: data.firstname,
                    admin: data.admin
                };

                Promise
                .all([jwtHelper.generateToken({ data: user }, key.secretKeyForCenter, key.tokenLife), 
                jwtHelper.generateToken({ data: user }, key.refreshSecretKeyForCenter, key.refreshTokenLife)])
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
                    .cookie('mapToken', key.mapToken)
                    .cookie('initialLocation', key.initialLocation)
                    .redirect('/center/overview');
                })
                .catch(function(error) {
                    logger.error('Generate accessToken error, id: s%, error: %s', data._id, error);
                    return res
                    .status(501)
                    .render('error/index.pug', {
                        code: 501,
                        message: 'Not Implemented'
                    });
                })
            }
            else {
                logger.warn('Auth fail, username: %s', req.body.username);
                return res
                .status(200)
                .render('login/control-center.pug', {
                    error: true,
                    values: req.body
                });
            }
        })
        .catch(function(error) {
            logger.error('Auth error, username: %s, error: %s', req.body.username, error);
            return res
            .status(200)
            .render('login/control-center.pug', {
                error: true,
                values: req.body
            });
        })
    },

}
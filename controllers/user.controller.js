var bcrypt = require('bcryptjs');
var userModel = require('../models/user.model');
var log4js = require('log4js');
var logger = log4js.getLogger('controllers.user');

module.exports = {
    createUser: function(req, res){
        req.body.password = bcrypt.hashSync(req.body.password, 10);
        var user = new userModel(req.body);
        user.save()
        .then(function(results) {
            logger.info('Render create user success');
            return res
            .status(200)
            .render('control-center/create.control-center.pug', {
                success: true,
                message: 'Tạo tài khoản thành công!'
            });
        })
        .catch(function(error) {
            logger.error('Render create user failed ', error)
            return res
            .status(501)
            .render('control-center/create.control-center.pug', {
                error: true,
                values: req.body,
                message: 'Tạo tài khoản thất bại!'
            });
        });
    },

    blockedUser: function(req, res) {
        userModel
        .findByIdAndUpdate(req.params.id, { $set: { blocked: true } })
        .select('_id')
        .then(function (data) {
            if (data) {
                logger.info('Blocked user id: %s', req.params.id);
                return res
                .status(200)
                .json({
                    status: 'success', 
                    message: 'Đã block!' 
                });
            }
            else {
                logger.warn('User not found to block, id: %s', req.params.id);
                return res
                .status(404)
                .json({ message: 'Not found!' });
            }
        })
        .catch(function (error) {
            logger.error('Blocked user: %s , error: %s', req.params.id, error);
            return res
            .status(200)
            .json({
                status: 'error', 
                message: 'Đã xảy ra lỗi, không thể block!' 
            });
        });
    },

    unlockedUser: function(req, res) {
        userModel
        .findByIdAndUpdate(req.params.id, { $set: { blocked: false }}).select('_id')
        .then(function (data) {
            if (data) {
                logger.info('Unlocked user id: %s', req.params.id);
                return res
                .status(200)
                .json({
                    status: 'success', 
                    message: 'Đã mở block!' 
                });
            }
            else {
                logger.warn('User not found to unlock, id: %s', req.params.id);
                return res
                .status(404)
                .json({ message: 'Not found!' });
            }
        })
        .catch(function (error) {
            logger.error('Unlocked user: %s , error: %s', req.params.id, error);
            return res
            .status(200)
            .json({
                status: 'error', 
                message: 'Đã xảy ra lỗi, không thể mở block!' 
            });
        })
    },

    deleteUser: function(req, res) {
        userModel
        .findByIdAndRemove(req.params.id)
        .select('_id')
        .then(function(data) {
            if (data) {
                logger.info('Deleted user id: %', req.params.id);
                return res
                .status(200)
                .json({
                    status: 'success', 
                    message: 'Đã xóa!' 
                });
            }
            else {
                logger.warn('User not found to delete, id: %s', req.params.id);
                return res
                .status(404)
                .json({ message: 'Not found!' });
            }
        })
        .catch(function(error) {
            logger.error('Deleted user: %s , error: %s', req.params.id, error);
            return res
            .status(200)
            .json({
                status: 'error', 
                message: 'Xóa người dùng thất bại!' 
            });
        });
    },

    //be not used yet
    
    getUser: function(req, res) {
        userModel
        .findById(req.params.id)
        .select('firstname lastname email phone')
        .then(function(data) {
            if (data) {
                logger.info('Get user id: %s', req.params.id);
                return res
                .status(200)
                .json(data);
            }
            else {
                logger.info('User not found to get, id: %s', req.params.id);
                return res
                .status(404)
                .json({ message: 'Not found!' });
            }
        })
        .catch(function(error) {
            logger.error('Get user id: %s , error: %s', req.params.id, error);
            return res
            .status(501)
            .json({ message: 'Error!' });
        });
    },

    //Be not used yet

    editUser: function(req, res) {
        userModel
        .findByIdAndUpdate(req.params.id, { $set: {
            email: req.body.email,
            fullname: req.body.fullname,
            phone: req.body.phone,
            address: req.body.address,
        }})
        .then(function(data) {
            if (data) {
                logger.info('Edited user id: %s', req.params.id);
                return res
                .status(200)
                .json({ message: 'Edited!' });
            }
            else {
                logger.info('User not found to edit, id: %s', req.params.id);
                return res
                .status(404)
                .json({ message: 'Not found!' });
            }
        })
        .catch(function(error) {
            logger.error('Edited user: %s, error: %s', req.params.id, error);
            return res
            .status(501)
            .json({ message: 'Error!' });
        })
    },

    //Be not used yet
    changePassword: function(req, res) {
        userModel
        .findById(req.params.id)
        .select('password')
        .then(function(data) {
            if (data) {
                if (bcrypt.compareSync(req.body.oldPassword, data.password)) {
                    userModel
                    .findByIdAndUpdate(req.params.id, { $set: {
                        password: bcrypt.hashSync(req.body.newPassword, 10)
                    }})
                    .then(function(results) {
                        logger.info('Changed password of user: %s', req.params.id);
                        return res
                        .status(301)
                        .json({ message: 'Password change successful!' })
                    })
                    .catch(function(error) {
                        logger.error('Changed password of user: %s , error: %s', req.params.id, error);
                        return res
                        .status(501)
                        .json({ message: 'Password change unsuccessful!' })
                    })
                }
                else {
                    logger.info('Old password incorrect, used id: %s', req.params.id);
                    return res
                    .status(400)
                    .json({ message: 'Old password incorrect!' })
                }
            }
            else {
                logger.info('User not found to change password, id: %s', req.params.id);
                return res
                .status(404)
                .json({ message: 'Not found!' })
            }
        })
        .catch(function(error) {
            logger.error('Changed password of user: %s , error: %s', req.params.id, error);
            return res
            .status(501)
            .json({ message: 'Error!' })
        })
    },
}
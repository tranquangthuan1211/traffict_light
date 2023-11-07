var intersectionModel = require('../models/intersection.model');

module.exports = {
    nameExists: function (req, res, next) {
        intersectionModel
        .findOne({ intersectionName: req.body.intersectionName })
        .select('_id')
        .then(function(results) {
            if (results) {
                return res
                .status(200)
                .json({
                    status: 'error', 
                    message: 'Tên giao lộ đã tồn tại!'
                })
            }
            else 
                next()
        })
        .catch(function(error) {
            console.log(error)
            return res
            .status(200)
            .json({
                status: 'error', 
                message: 'Khởi tạo thất bại!'
            })
        })
    },
}
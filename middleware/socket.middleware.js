var io = require('socket.io')();
var intersectionModel = require('../models/intersection.model');

var isValid = function(clientId) {
    intersectionModel.find({'trafficLight._id': clientId})
    .then(function() {
        return true
    })
    .catch(function() {
        return false
    })
}
var socketMiddleware = function() {
    io.use(function(socket, next) {
        let clientId = socket.handshake.headers['clientId'];
        if (isValid(clientId)) {
            return next();
        }
        return next(new Error('authentication error'));
    })
}

module.exports = socketMiddleware;
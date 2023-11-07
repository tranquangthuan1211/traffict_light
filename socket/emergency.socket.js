var intersectionModel = require('../models/intersection.model');

var log4js = require('log4js');
var logger = log4js.getLogger('socket.emergency');

module.exports = function(io) {
    const emergencyPath = io.of('/socket/emergency');

    emergencyPath.on('connect', function(socket) {
        var roomID = '';
        socket.on('room', function(data) {
            roomID = data;
            socket.join(data);
            logger.info('Socket ID %s joins room %s', socket.id, roomID);
        });

        socket.on('[vehicle]-emergency', function(data) {
            logger.info('Emitted emergency signal to ', data.idIntersection);
            emergencyPath.to(data.idIntersection).emit('[intersection]-emergency', {
                vehicleId: data.vehicleId,
                vehicleType: data.vehicleType,
                state: data.state,
                indexOfStreet: data.indexOfStreet
            });
        });
    });
};
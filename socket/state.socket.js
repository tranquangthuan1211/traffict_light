var log4js = require('log4js');
var logger = log4js.getLogger('socket.state');

module.exports = function(io) {
    const stateLightPath = io.of('/socket/state-light');

    stateLightPath.on('connect', function(socket) {
		var roomID = ''
		socket.on('room', function(data) {
			roomID = data;
            socket.join(data);
            logger.info('Socket ID %s joins room %s', socket.id, roomID);
		});

		socket.on('leave-room', function(data) {
            socket.leave(data);
            logger.info('Socket ID %s leaves room %s', socket.id, roomID);
		});

		socket.on('[intersection]-time-light', function(data) {
			stateLightPath.to(data.room).emit('[center]-time-light', data.data);
        });
        
		socket.on('[intersection]-light-state', function(data) {
			stateLightPath.to(data.room).emit('[center]-light-state', data.data);
		})
	})
}
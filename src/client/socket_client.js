const io = require('socket.io-client');
const socketClient = io();

socketClient.on('connect', () => {
	console.log('Socket is alive! (' + new Date() + ')');
});

module.exports = socketClient;

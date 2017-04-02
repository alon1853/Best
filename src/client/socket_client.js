const io = require('socket.io-client');

const socketClient = io('http://77.138.42.10:9090/', { path: '/api/v1/proxy/namespaces/default/services/ui-best-service/socket.io' });
//const socketClient = io();

socketClient.on('connect', () => {
	console.log('Socket is alive! (' + new Date() + ')');
});

module.exports = socketClient;

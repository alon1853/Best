const redis = require('redis');
const REDIS_HOST = process.env.REDIS_IP || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const redisClient = redis.createClient({ host: REDIS_HOST, port: REDIS_PORT });

redisClient.on('connect', () => {
  console.log('Redis is connected on ' + REDIS_HOST + ':' + REDIS_PORT + '..');
});

redisClient.on('error', (err) => {
  //console.log(err.toString());
});

module.exports = redisClient;

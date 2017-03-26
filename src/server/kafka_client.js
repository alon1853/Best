const kafkaRest = require('kafka-rest');
const KAFKA_HOST = 'localhost';
const KAFKA_PORT = 8082;

const kafka = new kafkaRest({ 'url': 'http://' + KAFKA_HOST + ':' + KAFKA_PORT });

kafka.topic('test').produce('message');

function ImportRedis(redisClient) {
  
}

module.exports = ImportRedis;

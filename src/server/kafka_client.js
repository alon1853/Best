const kafkaRest = require('kafka-rest');
const KAFKA_HOST = 'localhost';
const KAFKA_PORT = 8082;

const kafka = new kafkaRest({ 'url': 'http://' + KAFKA_HOST + ':' + KAFKA_PORT });

kafka.topic('test').produce('message');

function ImportRedis(redisClient) {
  redisClient.set("alon", "yosef");
  redisClient.get("alon", (err, data) => {
    if (!err) {
      //console.log(data);
    }
  });

  // client.hmset('tal', {name: "tal", age: 28}, (err, res) => {
  //   if (!err) {
  //     console.log(res);
  //     client.hgetall('tal', (err, res) => {
  //       console.log(res);
  //     });
  //   }
  // });
}

module.exports = ImportRedis;

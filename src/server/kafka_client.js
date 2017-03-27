const kafkaRest = require('kafka-rest');
const KAFKA_HOST = process.env.KAFKA_REST_PROXY_IP || 'localhost';
const KAFKA_PORT = process.env.KAFKA_REST_PROXY_PORT || 8082;

const fs = require('fs');

const kafka = new kafkaRest({ 'url': 'http://' + KAFKA_HOST + ':' + KAFKA_PORT });


function SimulateAvro() {
  kafka.topic('test2').produce('message', (err, res) => {
    if (!err) {
      console.log('Created topic test2 successfully!');
    } else {
      console.log(err);
    }
  });

  const schema = new kafkaRest.AvroSchema({
    "name": "TweetText",
    "type": "record",
    "fields": [
      { "name": "id", "type": "string" },
      { "name": "text", "type": "string" }
    ]
  });
  const target = kafka.topic('my-topic');
  const saved_data = {
    'id': '1',
    'text': 'My tweet'
  };
  let consumed = [];
  consumed.push(saved_data);

  target.produce(schema, consumed, (err, res) => {
    if (!err) {
      console.log('Sent topic my-topic with Avro successfully!!');
    } else {
      console.log(err);
    }
  });

  consumed = [];
}

SimulateAvro();

function ImportRedis(redisClient) {
}

module.exports = ImportRedis;

const kafkaRest = require('kafka-rest');
const KAFKA_HOST = 'localhost';
const KAFKA_PORT = 8082;
const fs = require('fs');

const kafka = new kafkaRest({ 'url': 'http://' + KAFKA_HOST + ':' + KAFKA_PORT });

//kafka.topic('test').produce('message');

function SimulateAvro() {
  fs.readFile('schemas/entityFamily.json', (err, data) => {
    if (err) {
      console.log('Can not simulate Avro, error while reading schema file');
    } else {
      const shemaAsJson = JSON.parse(data);

      const userIdSchema = new kafkaRest.AvroSchema("int");
      const userInfoSchema = new kafkaRest.AvroSchema(shemaAsJson);
      kafka.topic('entityFamily').produce(userInfoSchema, {'avro': 'record'}, {'avro': 'another record'});
    }
  });
}

SimulateAvro();

function ImportRedis(redisClient) {

}

module.exports = ImportRedis;

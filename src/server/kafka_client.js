const kafkaRest = require('kafka-rest');
const KAFKA_HOST = process.env.KAFKA_REST_PROXY_IP || 'localhost';
const KAFKA_PORT = process.env.KAFKA_REST_PROXY_PORT || 8082;

const kafka = new kafkaRest({ 'url': 'http://' + KAFKA_HOST + ':' + KAFKA_PORT });

function SimulateAvro() {
  function shutdown() {
    console.log("Exiting...");
    if (stream) stream.destroy();
  }

  kafka.consumer('my-group').join({ "format" : "avro" }, function(err, ci) {
    if (err) {
      console.log("Failed to create instance in consumer group: " + err);
    } else {
      consumer_instance = ci;
      var stream = consumer_instance.subscribe('my-topic');
      stream.on('data', function(msgs) {
        for(var i = 0; i < msgs.length; i++) {
          var tweet = msgs[i].value;
          console.log(tweet);
        }
      });
      stream.on('error', function(err) {
        console.log("Consumer instance reported an error: " + err);
        shutdown();
      });

      process.on('SIGINT', shutdown);
    }
  });

  let counter = 20;
  setInterval(() => {
    const schema = new kafkaRest.AvroSchema({
      "name": "TweetText",
      "type": "record",
      "fields": [
        { "name": "id", "type": "string" },
        { "name": "text", "type": "string" }
      ]
    });
    const target = kafka.topic('my-topic').partition(0);
    const saved_data = {
      'id': counter.toString(),
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
    counter++;
  }, 1000);

}

SimulateAvro();

function ImportRedis(redisClient) {
}

module.exports = ImportRedis;

const express =	require('express');
const app =	express();
const http =	require('http').Server(app);
const bodyParser = require('body-parser');
const socketServer = require('socket.io')(http);
const fs = require('fs');
const redis = require('redis');
const kafkaRest = require('kafka-rest');
const NODE_PORT = 4000;
const REDIS_HOST = process.env.REDIS_IP || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const KAFKA_HOST = process.env.KAFKA_REST_PROXY_IP || 'localhost';
const KAFKA_PORT = process.env.KAFKA_REST_PROXY_PORT || 8082;

const redisClient = redis.createClient({ host: REDIS_HOST, port: REDIS_PORT });
const kafkaClient = new kafkaRest({ 'url': 'http://' + KAFKA_HOST + ':' + KAFKA_PORT });

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const UPDATE_TOPIC_NAME = 'update';
const UPDATE_CONSUMER_GROUP_NAME = 'update-consumer-group';

// ---------- Events ----------

redisClient.on('connect', () => {
  console.log('Redis is connected on ' + REDIS_HOST + ':' + REDIS_PORT + '..');
});

redisClient.on('error', (err) => {
  //console.log(err.toString());
});

socketServer.on('connection', (socket) => {
  // const NUMBER_OF_ENTITIES = 100;
  // SimulateEntities(socketServer, NUMBER_OF_ENTITIES);

  SubscribeToEntityUpdatesFromKafka();

  // setTimeout(() => {
  //   const entityData = {
  //     "coordinate": {
  //       "lat": 33,
  //       "long": 33.4
  //     },
  //     "isNotTracked": false,
  //     "entityOffset": 1
  //   };
  //
  //   SendEntityToKafka(entityData);
  // }, 2000);
});

// ---------- Logic ----------

function SubscribeToEntityUpdatesFromKafka() {
  kafkaClient.consumer(UPDATE_CONSUMER_GROUP_NAME).join({ "format": "avro" }, function(err, ci) {
    if (err) {
      console.log('Failed to create instance in consumer group: ' + err);
    } else {
      const stream = ci.subscribe(UPDATE_TOPIC_NAME);

      console.log('Subscribed to topic ' + UPDATE_TOPIC_NAME + ' successfully!');

      stream.on('data', function(msgs) {
        console.log(msgs);
        
        for(let i = 0; i < msgs.length; i++) {
          const entity = msgs[i].value;

          if (SaveEntity(entity)) {
            GetEntity(entity.entityID, SuccessReadEntityFromDatabase, ErrorReadEntityFromDatabase);
          }

          console.log(entity);
        }
      });

      stream.on('error', function(err) {
        console.log("Consumer instance reported an error: " + err);
      });
    }
  });
}

function SendEntityToKafka(entity) {
  const systemEntitySchema = GetSchema('systemEntity', (err) => {
    return undefined;
  }, (data) => {
    return data;
  });

  const generalEntityAttributesSchema = GetSchema('generalEntityAttributes', (err) => {
    return undefined;
  }, (data) => {
    return data;
  });

  GetSchema('basicEntityAttributes', (err) => {
    console.log(err);
  }, (data) => {
    const schema = new kafkaRest.AvroSchema(data);
    const target = kafkaClient.topic(UPDATE_TOPIC_NAME).partition(0);

    let consumed = [];
    consumed.push(entity);

    target.produce(schema, consumed, (err, res) => {
      if (!err) {
        console.log('Sent topic "update" with Avro successfully!!');
      } else {
        console.log(err);
      }
    });

    consumed = [];
  });
}

function SimulateEntities(socketServer, numberOfEntities) {
  const entity = { id: 0, lat: 32.82994, long: 34.99019 };
  let id = 0;
  let relative = 0;

  const intervalId = setInterval(() => {
    if (id < numberOfEntities) {
      let tempEntity = JSON.parse(JSON.stringify(entity));
      tempEntity.id = id;
      tempEntity.lat += relative;
      tempEntity.long += relative;

      if (SaveEntity(tempEntity)) {
        GetEntity(id, SuccessReadEntityFromDatabase, ErrorReadEntityFromDatabase);
      }

      relative -= 0.0003;
      id++;
    } else {
      clearInterval(intervalId);
      SimulateEntitiesUpdates(id);
    }
  }, 100);
}

function SimulateEntitiesUpdates(id) {
  id--;
  let relative = -0.001;

  const intervalId = setInterval(() => {
    if (id >= 0) {
      GetEntity(id, (entity) => {
        entity.lat += relative;
        entity.long += relative;

        SuccessReadEntityFromDatabase(entity);
        SaveEntity(entity);
      }, (id) => {

      });

      //relative -= 0.0003;
      id--;
    } else {
      clearInterval(intervalId);
    }
  }, 100);
}

function SaveEntity(entity) {
  return redisClient.set(entity.entityID, JSON.stringify(entity));
}

function GetEntity(id, successCallback, errorCallback) {
  redisClient.get(id.toString(), (err, res) => {
    if (!err) {
      successCallback(JSON.parse(res));
    } else {
      errorCallback(id);
    }
  });
}

function SuccessReadEntityFromDatabase(entity) {
  socketServer.emit('recieve-entity', entity);
}

function ErrorReadEntityFromDatabase(id) {
  console.log('Error: cannot find entity with id = ' + id);
}

function GetSchema(schemaName, errCallback, successCallback) {
  const SCHEMAS_FOLDER = 'schemas/';
  const SCHEMA_FORMAT = '.json';

  fs.readFile(SCHEMAS_FOLDER + schemaName + SCHEMA_FORMAT, (err, data) => {
    if (err) {
      errCallback('Error, can not access file ' + SCHEMAS_FOLDER + schemaName + SCHEMA_FORMAT);
    } else {
      successCallback(JSON.parse(data));
    }
  });
}

app.get('/getSchema/:schemaName', (req, res) => {
  const schemaName = req.params.schemaName;

  GetSchema(schemaName, (err) => {
    res.send(err);
  }, (data) => {
    res.send(data);
  });
});

app.post('/sendTopic/:topicName', (req, res) => {
  const topicName = req.params.topicName;
  res.send(JSON.stringify(req.body));
});

http.listen(NODE_PORT, () => {
  console.log('Server is running on port ' + NODE_PORT + '..');
});

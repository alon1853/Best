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
const MERGE_TOPIC_NAME = 'merge';
const UPDATE_CONSUMER_GROUP_NAME = 'update-consumer-group';

// ---------- Events ----------

redisClient.on('connect', () => {
  console.log('Redis is connected on ' + REDIS_HOST + ':' + REDIS_PORT + '..');
});

redisClient.on('error', (err) => {
  //console.log(err.toString());
});

socketServer.on('connection', (socket) => {
  redisClient.keys('*', (err, keys) => {
    for (let i = 0; i < keys.length; i++) {
      GetEntityFromDatabase(keys[i], SuccessReadEntityFromDatabase, ErrorReadEntityFromDatabase);
    }
  });

  socket.on('entities-merge', (entitiesIDs) => {
    MergeEntities(entitiesIDs);
  });
});

// ---------- Init ----------

SubscribeToEntityUpdatesFromKafka();

let mergeSchema;
GetSchema('merge_schema.json', (err) => {
  console.log(err);
}, (schema) => {
  mergeSchema = schema;
});

// GetSchema('update_schema.json', (err) => {
//   console.log(err);
// }, (schema) => {
//   let id = 1;
//   let lat = 32.82994;
//   let long = 34.99019;
//   let entities = [];
//
//   for (let i = 0; i < 5; i++) {
//     const entity = {
//       "entityID": id.toString(),
//       "entityAttributes": {
//         "basicAttributes": {
//           "coordinate": {
//             "lat": lat,
//             "long": long
//           },
//           "isNotTracked": false,
//           "entityOffset": 0
//         },
//         "speed": 12,
//         "elevation": 0,
//         "course": 0,
//         "nationality": "ISRAEL",
//         "category": "airplane",
//         "pictureURL": "url",
//         "height": 0,
//         "nickname": "nickname",
//         "externalSystemID": "11"
//       },
//       "sons":{
//         "array": []
//       }
//     }
//
//     entities.push(entity);
//
//     id++;
//     lat -= 0.0032;
//     long -= 0.0032;
//   }
//
//   setTimeout(() => {
//     SendDataToKafka(UPDATE_TOPIC_NAME, schema, entities);
//   }, 2000);
// });

// ---------- Logic ----------

function SubscribeToEntityUpdatesFromKafka() {
  kafkaClient.consumer(UPDATE_CONSUMER_GROUP_NAME).join({ "format": "avro" }, (err, ci) => {
    if (err) {
      console.log('Failed to create instance in consumer group: ' + err);
    } else {
      const stream = ci.subscribe(UPDATE_TOPIC_NAME);

      console.log('Subscribed to topic ' + UPDATE_TOPIC_NAME + ' successfully!');

      stream.on('data', function(msgs) {
        for(let i = 0; i < msgs.length; i++) {
          const entity = msgs[i].value;

          console.log('Received entity with entityID = ' + entity.entityID);

          if (SaveEntityToDatabase(entity)) {
            GetEntityFromDatabase(entity.entityID, SuccessReadEntityFromDatabase, ErrorReadEntityFromDatabase);
          }
        }
      });

      stream.on('error', function(err) {
        console.log("Consumer instance reported an error: " + err);
      });
    }
  });
}

function SendDataToKafka(topicName, schema, dataArray) {
  const avroSchema = new kafkaRest.AvroSchema(schema);
  const targetTopic = kafkaClient.topic(topicName).partition(0);

  targetTopic.produce(avroSchema, dataArray, (err, res) => {
    if (!err) {
      console.log('Sent topic "' + topicName + '" with Avro successfully!!');
    } else {
      console.log(err);
    }
  });
}

function SaveEntityToDatabase(entity) {
  return redisClient.set(entity.entityID, JSON.stringify(entity));
}

function GetEntityFromDatabase(id, successCallback, errorCallback) {
  redisClient.get(id, (err, res) => {
    if (!err) {
      successCallback(JSON.parse(res));
    } else {
      errorCallback(id);
    }
  });
}

function SuccessReadEntityFromDatabase(entity) {
  const entityToClient = {
    id: entity.entityID,
    lat: entity.entityAttributes.basicAttributes.coordinate.lat,
    long: entity.entityAttributes.basicAttributes.coordinate.long
  };

  socketServer.emit('recieve-entity', entityToClient);
}

function ErrorReadEntityFromDatabase(id) {
  console.log('Error: cannot find entity with id = ' + id);
}

function MergeEntities(entitiesIDs) {
  let idObjects = [];

  const entitiesAsSchema = {
    "mergedEntitiesId": {
      "array": entitiesIDs
    }
  };

  dataToSend = [];
  dataToSend.push(entitiesAsSchema);
  SendDataToKafka(MERGE_TOPIC_NAME, mergeSchema, dataToSend);
}

function GetSchema(schemaName, errCallback, successCallback) {
  fs.readFile('schemas/' + schemaName, (err, data) => {
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

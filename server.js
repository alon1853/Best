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
const SPLIT_TOPIC_NAME = 'split';
const UPDATE_CONSUMER_GROUP_NAME = 'update-consumer-group';

// ---------- Events ----------

redisClient.on('connect', () => {
  console.log('Redis is connected on ' + REDIS_HOST + ':' + REDIS_PORT + '..');

  redisClient.flushdb((err, res) => {
    if (!err) {
      console.log('Flashed Redis successfully!');
      // SimulateEntitiesToDatabase();
    } else {
      console.log(err);
    }
  });
});

redisClient.on('error', (err) => {
  //console.log(err.toString());
});

socketServer.on('connection', (socket) => {
});

// ---------- Init ----------

SubscribeToEntityUpdatesFromKafka();

let mergeSchema;
GetSchema('merge_schema.json', (err) => {
  console.log(err);
}, (schema) => {
  mergeSchema = schema;
});

let splitSchema;
GetSchema('split_schema.json', (err) => {
  console.log(err);
}, (schema) => {
  splitSchema = schema;
});

// ---------- Logic ----------

function SimulateEntitiesToDatabase() {
  console.log('Starting to simulate entities...');

  let id = 0;
  let lat = 32.82994;
  let long = 34.99019;
  const NUMBER_OF_ENTITIES = 20;

  for (let i = 0; i < NUMBER_OF_ENTITIES; i++) {
    const entity = {
      "entityID": id.toString(),
      "entityAttributes": {
        "basicAttributes": {
          "coordinate": {
            "lat": lat,
            "long": long
          }
        }
      },
      "sons": {
        "array": [
          {
            "entityID": id.toString()
          }
        ]
      }
    };

    id++;
    lat -= 0.01;
    long -= 0.01;

    SaveEntityToDatabase(entity, () => {
      if (i === NUMBER_OF_ENTITIES - 1) {
        SendUpdateToClient();
      }
    });
  }
}

function SendUpdateToClient() {
  socketServer.emit('entities-update');
}

function SubscribeToEntityUpdatesFromKafka() {
  kafkaClient.consumer(UPDATE_CONSUMER_GROUP_NAME).join({ "format": "avro", "auto.offset.reset": "smallest" }, (err, ci) => {
    if (err) {
      console.log('Failed to create instance in consumer group: ' + err);
    } else {
      const stream = ci.subscribe(UPDATE_TOPIC_NAME);

      console.log('Subscribed to topic ' + UPDATE_TOPIC_NAME + ' successfully!');

      stream.on('data', function(msgs) {
        for(let i = 0; i < msgs.length; i++) {
          const entity = msgs[i].value;

          console.log('Received entity with entityID = ' + entity.entityID);

          SaveEntityToDatabase(entity, SendUpdateToClient);
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

function SaveEntityToDatabase(entity, finishCallback) {
  if (entity.stateChanges === "MERGED") {
    console.log('Got entity ' + entity.entityID + ' with stateChanges = "MERGED", deleting sons:');

    const sons = entity.sons.array;

    for (let i = 0; i < sons.length; i++) {
      console.log(sons[i].entityID);
      redisClient.del(sons[i].entityID);
    }
  }

  redisClient.set(entity.entityID, JSON.stringify(entity), () => {
    finishCallback();
  });
}

function GetEntitiesByKeys(keys, entitiesArray, entitiesObject, finishCallback) {
  if (keys.length === 0) {
    finishCallback();
  } else {
    for (let i = 0; i < keys.length; i++) {
      redisClient.get(keys[i], (err, res) => {
        if (!err) {
          const entity = JSON.parse(res);
          entitiesArray.push(entity);
          entitiesObject[entity.entityID] = entity;

          if (keys.length - 1 === i) {
            finishCallback();
          }
        } else {
          console.log(err);
          finishCallback();
        }
      });
    }
  }
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

app.post('/mergeEntities', (req, res) => {
  const entitiesIDs = req.body["data[]"];
  let entitiesArray = [];
  let entitiesObject = {};

  GetEntitiesByKeys(entitiesIDs, entitiesArray, entitiesObject, () => {
    const familiesAsSchema = {
      "mergedFamilies": {
        "array": entitiesArray
      }
    };

    dataToSend = [];
    dataToSend.push(familiesAsSchema);
    SendDataToKafka(MERGE_TOPIC_NAME, mergeSchema, dataToSend);

    res.send(true);
  });
});

app.post('/splitEntity', (req, res) => {
  const entityID = req.body.entityID;

  const entityAsSchema = {
    "splittedEntityID": entityID
  };

  dataToSend = [];
  dataToSend.push(entityAsSchema);
  SendDataToKafka(SPLIT_TOPIC_NAME, splitSchema, dataToSend);

  res.send(true);
});

app.get('/getEntities/all', (req, res) => {
  let entitiesArray = [];
  let entitiesObject = {};

  redisClient.keys('*', (err, keys) => {
    if (!err) {
      GetEntitiesByKeys(keys, entitiesArray, entitiesObject, () => {
        res.send(JSON.stringify(entitiesObject));
      });
    } else {
      res.send(err);
    }
  });
});

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

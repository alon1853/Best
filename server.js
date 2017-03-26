const express =	require('express');
const app =	express();
const http =	require('http').Server(app);
const bodyParser = require('body-parser');
const socketServer = require('socket.io')(http);
const fs = require('fs');
const NODE_PORT = 4000;

const redisClient = require('./src/server/redis_client.js');
const kafkaClient = require('./src/server/kafka_client.js')(redisClient);

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

socketServer.on('connection', (socket) => {
  const NUMBER_OF_ENTITIES = 50;
  SimulateEntities(socketServer, NUMBER_OF_ENTITIES);
});

function SimulateEntities(socketServer, numberOfEntities) {
  const entity = { id: 0, lat: 32.82994, long: 34.99019 };
  let id = 0;
  let relative = 0;
  let entities = {};

  const intervalId = setInterval(() => {
    if (id < numberOfEntities) {
      let tempEntity = JSON.parse(JSON.stringify(entity));
      tempEntity.id = id;
      tempEntity.lat += relative;
      tempEntity.long += relative;

      const entityIdFromDatabase = SaveEntity(tempEntity);

      if (entityIdFromDatabase != -1) {
        const entityFromDatabase = GetEntity(entityIdFromDatabase);
        socketServer.emit('recieve-entity', entityFromDatabase);
      }

      relative -= 0.0003;
      id++;
    } else {
      clearInterval(intervalId);
    }
  }, 100);
}

function SaveEntity(entity) {
  redisClient.hmset(entity.id, {id: entity.id, lat: entity.lat, long: entity.long}, (err, res) => {
    if (!err) {
      return entity.id;
    } else {
      return -1;
    }
  });
}

function GetEntity(id) {
  redisClient.hgetall(id, (err, res) => {
    if (!err) {
      return res;
    } else {
      return { id: -1, lat: 0, long: 0 };
    }
  });
}

app.get('/getSchema/:schemaName', (req, res) => {
  const schemaName = req.params.schemaName;

  fs.readFile('schemas/' + schemaName + '.json', (err, data) => {
    if (err) {
      res.send('Error, can not access schema ' + schemaName);
    } else {
      res.send(JSON.parse(data));
    }
  });
});

app.post('/sendTopic/:topicName', (req, res) => {
  const topicName = req.params.topicName;
  res.send(JSON.stringify(req.body));
});

http.listen(NODE_PORT, () => {
  console.log('Server is running on port ' + NODE_PORT + '..');
});

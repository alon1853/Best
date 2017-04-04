import React from 'react';
import { render } from 'react-dom';
import $ from 'jquery';
import MapContainer from './map_container.jsx';
import MapPanel from './map_panel.jsx';
import OpenLayers from './openlayers.jsx';

const socketClient = require('./socket_client.js');

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      entities: {}
    };

    this.PullEntitiesFromServer = this.PullEntitiesFromServer.bind(this);

    this.PullEntitiesFromServer();
  }

  componentWillMount() {
    socketClient.on('reconnect', () => {
      console.log('Socket reconnected! Start pulling from server..');
      this.PullEntitiesFromServer();
    });

    socketClient.on('entities-update', () => {
      console.log('Got an update from the server, pulling from the server..');
      this.PullEntitiesFromServer();
    });
  }

  PullEntitiesFromServer() {
    $.get('getEntities/all', (entities) => {
      entities = JSON.parse(entities);
      let updatedEntities = {};
      const keys = Object.keys(entities);

      for (let i = 0; i < keys.length; i++) {
        const entity = entities[keys[i]];
        updatedEntities[entity.entityID] = entity;
      }

      this.setState({ entities: updatedEntities });
    });
  }

  // <MapContainer center={[32.673290963389306, 34.83748543481079]} zoom={8} divClass={'map-container'} entities={this.state.entities} />

  render() {
    return (
      <div>
        <MapPanel entitiesNumber={Object.keys(this.state.entities).length} />
        <OpenLayers center={[35.081791, 32.839458]} zoom={12} entities={this.state.entities} />
      </div>
    );
  }
}

render(<App />, document.getElementById('app'));

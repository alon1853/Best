import React from 'react';
import { render } from 'react-dom';
import MapContainer from './map_container.jsx';
import MapPanel from './map_panel.jsx';

const socketClient = require('./socket_client.js');

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      entities: {}
    };

    this.RecieveEntity = this.RecieveEntity.bind(this);
  }

  componentWillMount() {
    socketClient.on('recieve-entity', (entity) => {
      this.RecieveEntity(entity);
    });
  }

  RecieveEntity(entity) {
    const id = entity.id;
    let currentEntities = this.state.entities;
    if (currentEntities[id]) {
      currentEntities[id].lat = entity.lat;
      currentEntities[id].long = entity.long;
    } else {
      currentEntities[id] = { lat: entity.lat, long: entity.long };
    }

    this.setState({ entities: currentEntities });
  }

  render() {
    return (
      <div>
        <MapPanel entitiesNumber={Object.keys(this.state.entities).length} />
        <MapContainer center={[32.82994, 34.99019]} zoom={16} divClass={'map-container'} entities={this.state.entities} />
      </div>
    );
  }
}

render(<App />, document.getElementById('app'));

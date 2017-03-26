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
    this.ShouldUpdateEntity = this.ShouldUpdateEntity.bind(this);
  }

  componentWillMount() {
    socketClient.on('recieve-entity', (entity) => {
      this.RecieveEntity(entity);
    });
  }

  ShouldUpdateEntity(entity) {
    return !(this.state.entities[entity.id] && JSON.stringify(entity) === JSON.stringify(this.state.entities[entity.id]));
  }

  RecieveEntity(entity) {
    if (this.ShouldUpdateEntity(entity)) {
      this.state.entities[entity.id] = { lat: entity.lat, long: entity.long };
      this.setState({ entities: this.state.entities });
    }
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

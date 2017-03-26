import React from 'react';
import { render } from 'react-dom';
import { Leaflet } from 'leaflet';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';

class MapContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mapStyle: { width: "0px", height: "0px" }
    };

    this.UpdateMapSize = this.UpdateMapSize.bind(this);
  }

  UpdateMapSize() {
    this.setState({ mapStyle: { width: window.innerWidth + 'px', height: window.innerHeight + 'px' } });
  }

  componentWillMount() {
    this.UpdateMapSize();
  }

  componentDidMount() {
    window.addEventListener('resize', this.UpdateMapSize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.UpdateMapSize);
  }

  render() {
    const tileLayerOptions = {
      id: 'mapbox.streets',
      accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
    }
    const url = 'https://api.tiles.mapbox.com/v4/' + tileLayerOptions.id + '/{z}/{x}/{y}.png?access_token=' + tileLayerOptions.accessToken;

    const markers = Object.keys(this.props.entities).map((key, index) => {
      const entity = this.props.entities[key];
      const position = [entity.lat, entity.long];

      return (
        <Marker position={position} key={key}>
          <Popup>
            <span>A pretty CSS3 popup.<br/>Easily customizable.</span>
          </Popup>
        </Marker>
      );
    });

    return (
      <Map center={this.props.center} zoom={this.props.zoom} style={this.state.mapStyle} className={this.props.divClass}>
        <TileLayer url={url} />
        { markers }
      </Map>
    );
  }
}

MapContainer.propTypes = {
  center: React.PropTypes.array,
  zoom: React.PropTypes.number,
  divClass: React.PropTypes.string,
  entities: React.PropTypes.object
};

MapContainer.defaultProps = {
  center: [33, 33],
  zoom: 14,
  divClass: '',
  entities: {}
};

export default MapContainer;

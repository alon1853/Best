import React from 'react';
import { render } from 'react-dom';
import { Map, TileLayer } from 'react-leaflet';
import MapMarkers from './map_markers.jsx';

class MapContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mapStyle: { width: 0, height: 0 }
    };

    this.UpdateMapSize = this.UpdateMapSize.bind(this);
  }

  UpdateMapSize() {
    this.setState({ mapStyle: { width: window.innerWidth, height: window.innerHeight } });
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
    };
    const url = 'https://api.tiles.mapbox.com/v4/' + tileLayerOptions.id + '/{z}/{x}/{y}.png?access_token=' + tileLayerOptions.accessToken;

    return (
      <Map center={this.props.center} zoom={this.props.zoom} style={this.state.mapStyle} className={this.props.divClass} ref="mapElement">
        <TileLayer url={url} />
        <MapMarkers entities={this.props.entities} />
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

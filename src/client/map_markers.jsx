import React from 'react';
import { Marker, Popup } from 'react-leaflet';

class MapMarkers extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
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
        <div>
          {markers}
        </div>
      );
  }
}

MapMarkers.propTypes = {
  entities: React.PropTypes.object
};

MapMarkers.defaultProps = {
  entities: {}
}

export default MapMarkers;

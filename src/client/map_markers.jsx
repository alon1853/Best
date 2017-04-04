import React from 'react';
import { Marker, Popup } from 'react-leaflet';

class MapMarkers extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
      const markers = Object.keys(this.props.entities).map((key, index) => {
        const entity = this.props.entities[key];
        const coordinate = entity.entityAttributes.basicAttributes.coordinate;
        const position = [coordinate.lat, coordinate.long];

        return (
          <Marker position={position} key={key}>
            <Popup>
              <span>{key}</span>
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

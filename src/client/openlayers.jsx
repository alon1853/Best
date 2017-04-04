import React from 'react';
import ol from 'openlayers';

class OpenLayers extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mapStyle: { width: 0, height: 0 },
      popupContent: ""
    };

    this.UpdateMapSize = this.UpdateMapSize.bind(this);
    this.ConvertXYToLatLong = this.ConvertXYToLatLong.bind(this);
    this.ConvertLongLatToXY = this.ConvertLongLatToXY.bind(this);
    this.UpdatePopupContent = this.UpdatePopupContent.bind(this);
    this.InitMapFeatures = this.InitMapFeatures.bind(this);
    this.InitMapOverlays = this.InitMapOverlays.bind(this);
    this.InitMap = this.InitMap.bind(this);
    this.InitMapEvents = this.InitMapEvents.bind(this);
  }

  UpdateMapSize() {
    this.setState({ mapStyle: { width: window.innerWidth, height: window.innerHeight } });
  }

  ConvertXYToLatLong(coordinate) {
    return ol.proj.transform(coordinate, 'EPSG:4326', 'EPSG:3857');
  }

  ConvertLongLatToXY(coordinate) {
    return ol.proj.transform(coordinate, 'EPSG:4326', 'EPSG:3857');
  }

  InitMapFeatures() {
    this.features = [];

    this.vectorSource = new ol.source.Vector({
      features: this.features
    });

    this.vectorLayer = new ol.layer.Vector({
      source: this.vectorSource
    });
  }

  InitMapOverlays() {
    this.overlays = [];

    const popupOverlay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
      element: this.refs.popupContainer,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    }));

    this.overlays.push(popupOverlay);
  }

  InitMap() {
    this.map = new ol.Map({
      layers: [
        new ol.layer.Tile({
          source: new ol.source.BingMaps({
            key: 'Al3i43Rdpip0MkeoDhLdN3hhh3Ye0K8aSbkkzb7BwHTt58xcPR4mNnc2FTzJMDh3',
            imagerySet: 'Road'
          })
        }),
        this.vectorLayer
      ],
      overlays: this.overlays,
      target: this.refs.mapDiv,
      view: new ol.View({
        center: ol.proj.fromLonLat(this.props.center),
        zoom: this.props.zoom
      })
    });

    this.map.addControl(new ol.control.MousePosition({
      coordinateFormat: ol.coordinate.createStringXY(4),
      projection: 'EPSG:4326'
    }));
  }

  InitMapEvents() {
    this.mapSelect = new ol.interaction.Select({
      condition: ol.events.condition.click
    });

    this.mapSelect.on('select', (e) => {
      const selectedFeatures = e.target.getFeatures().getArray();

      if (selectedFeatures.length > 0) {
        const feature = selectedFeatures[0];
        this.UpdatePopupContent(0, feature.getId(), feature.getGeometry().getLastCoordinate());
      } else {
        this.UpdatePopupContent(0, "", undefined);
      }
    });

    this.map.addInteraction(this.mapSelect);
  }

  UpdatePopupContent(overlayID, content, coordinate) {
    this.setState({ popupContent: content });
    this.overlays[overlayID].setPosition(coordinate);
  }

  componentWillMount() {
    this.UpdateMapSize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.UpdateMapSize);
  }

  componentDidMount() {
    window.addEventListener('resize', this.UpdateMapSize);

    this.InitMapFeatures();
    this.InitMapOverlays();
    this.InitMap();
    this.InitMapEvents();
  }

  componentWillReceiveProps(nextProps) {
    const keys = Object.keys(nextProps.entities);
    let tempFeatures = [];

    for (let i = 0; i < keys.length; i++) {
      const currentEntity = nextProps.entities[keys[i]];
      const coordinate = currentEntity.entityAttributes.basicAttributes.coordinate;

      const feature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([coordinate.long, coordinate.lat]))
      });

      feature.setId(keys[i]);

      feature.setStyle(new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
          color: '#c95145',
          src: 'dot.png'
        }))
      }));

      tempFeatures.push(feature);
    }

    this.vectorSource.clear();
    this.vectorSource.addFeatures(tempFeatures);
  }

  // <a href="#" className="ol-popup-closer"></a>

  render() {
    return (
      <div>
        <div ref="popupContainer" className="ol-popup">
          <div>{this.state.popupContent}</div>
        </div>
        <div style={this.state.mapStyle} ref="mapDiv"></div>
      </div>
    );
  }
}

OpenLayers.propTypes = {
  center: React.PropTypes.array,
  zoom: React.PropTypes.number,
  entities: React.PropTypes.object
};

OpenLayers.defaultProps = {
  center: [35, 35],
  zoom: 16,
  entities: {}
};

export default OpenLayers;

import React from 'react';
import EntitiesMerge from './entities_merge.jsx';
import EntitiesSplit from './entities_split.jsx';

class MapPanel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="panel">
        <div style={{color: "#fff", marginTop: "10px", marginLeft: "10px"}}>
          <div>Total Entities: {this.props.entitiesNumber}</div>
          <EntitiesMerge />
          <EntitiesSplit />
        </div>
      </div>
    );
  }
}

MapPanel.propTypes = {
  entitiesNumber: React.PropTypes.number.isRequired
}

export default MapPanel;

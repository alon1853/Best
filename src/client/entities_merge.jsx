import React from 'react';

class EntitiesMerge extends React.Component {
  constructor(props) {
    super(props);

    this.MergeClicked = this.MergeClicked.bind(this);
  }

  MergeClicked(e) {
    e.preventDefault();

    const entitiesIDs = this.refs.entitiesIDs.value.split(',');
    this.refs.entitiesIDs.value = '';

    if (entitiesIDs[0] !== "") {
      this.props.mergeEntities(entitiesIDs);
    }
  }

  render() {
    return(
      <div>
        <span style={{marginTop: "5px", borderBottom: "1px #fff dashed"}}>Merge Entities</span>
        <div className="panelMergeEntities">
          <form className="form-inline" onSubmit={this.MergeClicked}>
            <label className="mr-sm-2" htmlFor="entitiesIDs">Entities IDs:</label>
            <input type="text" className="form-control mb-2 mr-sm-2 mb-sm-0" ref="entitiesIDs" id="entitiesIDs" placeholder="ID1,ID2,ID3,..." />

            <button type="submit" className="btn btn-primary">Merge</button>
          </form>
        </div>
      </div>
    );
  }
}

EntitiesMerge.PropTypes = {
  mergeEntities: React.PropTypes.func.isRequired
};

export default EntitiesMerge;

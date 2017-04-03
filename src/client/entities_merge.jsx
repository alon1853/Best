import React from 'react';
import $ from 'jquery';

class EntitiesMerge extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messageColor: "",
      messageText: ""
    }

    this.MergeClicked = this.MergeClicked.bind(this);
  }

  MergeClicked(e) {
    e.preventDefault();

    const entitiesIDs = this.refs.entitiesIDs.value.split(',');
    this.refs.entitiesIDs.value = '';

    const arrayLength = entitiesIDs.length;

    if (entitiesIDs[0] !== "" && arrayLength > 1) {
      let shouldMerge = true;

      // for (let i = 0; shouldMerge && i < arrayLength; i++) {
      //   if (!this.props.entities[entitiesIDs[i]]) {
      //     shouldMerge = false;
      //     this.setState({messageColor: "red", messageText: "Please insert valid IDs"});
      //   }
      // }

      if (shouldMerge) {
        $.post('mergeEntities', { data: entitiesIDs }, (result) => {
          if (result) {
            this.setState({messageColor: "green", messageText: "Entities merged successfully!"});
          }
        });
      }
    } else {
      this.setState({messageColor: "red", messageText: "Please insert at least two IDs"});
    }
  }

  render() {
    return(
      <div>
        <span className="panelEntitiesTitle">Merge Entities</span>
        <div className="panelEntities">
          <form className="form-inline" onSubmit={this.MergeClicked}>
            <label className="mr-sm-2" htmlFor="entitiesIDs">Entities IDs:</label>
            <input type="text" className="form-control mb-2 mr-sm-2 mb-sm-0" ref="entitiesIDs" id="entitiesIDs" placeholder="ID1,ID2,ID3,..." />

            <button type="submit" className="btn btn-primary">Merge</button>
          </form>

          <div style={{color: this.state.messageColor}}>{this.state.messageText}</div>
        </div>
      </div>
    );
  }
}

EntitiesMerge.PropTypes = {
  entities: React.PropTypes.array
};

EntitiesMerge.defaultProps = {
  entities: []
}

export default EntitiesMerge;

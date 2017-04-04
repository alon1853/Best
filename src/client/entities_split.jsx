import React from 'react';

class EntitiesSplit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messageColor: "",
      messageText: ""
    };

    this.SplitClicked = this.SplitClicked.bind(this);
  }

  SplitClicked(e) {
    e.preventDefault();

    const entityID = this.refs.entityID.value;
    this.refs.entityID.value = '';


    if (entityID !== "") {
      let shouldSplit = true;

      // for (let i = 0; shouldMerge && i < arrayLength; i++) {
      //   if (!this.props.entities[entitiesIDs[i]]) {
      //     shouldMerge = false;
      //     this.setState({messageColor: "red", messageText: "Please insert valid IDs"});
      //   }
      // }

      if (shouldSplit) {
        $.post('slpitEntity', { entityID: entityID }, (result) => {
          if (result) {
            this.setState({messageColor: "green", messageText: "Entity splitted successfully!"});
          }
        });
      }
    } else {
      this.setState({messageColor: "red", messageText: "Please insert entity id"});
    }
  }

  render() {
    return(
      <div>
        <span className="panelEntitiesTitle">Split Entity</span>
        <div className="panelEntities">
          <form className="form-inline" onSubmit={this.SplitClicked}>
            <label className="mr-sm-2" htmlFor="entityID">Entity ID:</label>
            <input type="text" className="form-control mb-2 mr-sm-2 mb-sm-0" ref="entityID" id="entityID" placeholder="entityID" />

            <button type="submit" className="btn btn-primary">Split</button>
          </form>

          <div style={{color: this.state.messageColor}}>{this.state.messageText}</div>
        </div>
      </div>
    );
  }
}

export default EntitiesSplit;

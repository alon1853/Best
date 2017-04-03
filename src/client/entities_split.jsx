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

  SplitClicked() {

  }

  render() {
    return(
      <div>
        <span className="panelEntitiesTitle">Split Entity</span>
        <div className="panelEntities">
          <form className="form-inline" onSubmit={this.SplitClicked}>
            <label className="mr-sm-2" htmlFor="entitiesIDs">Entity ID:</label>
            <input type="text" className="form-control mb-2 mr-sm-2 mb-sm-0" ref="entitiesIDs" id="entitiesIDs" placeholder="ID1,ID2,ID3,..." />

            <button type="submit" className="btn btn-primary">Split</button>
          </form>

          <div style={{color: this.state.messageColor}}>{this.state.messageText}</div>
        </div>
      </div>
    );
  }
}

export default EntitiesSplit;

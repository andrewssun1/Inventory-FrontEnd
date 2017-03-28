import React from "react";
import {checkAuthAndAdmin, restRequest} from "../Utilities.js";
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;

export default class SubscribedManagerTable extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      dataResults : null
    };
    this.getSubscribedManagers = this.getSubscribedManagers.bind(this);
  }

  componentWillMount() {
    this.getSubscribedManagers();
  }

  getSubscribedManagers() {
    restRequest("GET", "/api/email/subscribedManagers/", "application/json", null,
                  (responseText)=>{
                    let response = JSON.parse(responseText);
                    let results = response.results;
                    for(var i = 0; i < results.length; i ++) {
                      results[i]['username'] = results[i].member.username;
                      results[i]['email'] = results[i].member.email;
                    }
                    this.setState({dataResults: results});
                  }, ()=>{});
  }

  render(){
    if(this.state.dataResults == null) return (null);
    return(
      <div>
      <h4> Subscribed Managers </h4>
      <BootstrapTable ref="subscribedManagersTable" data={this.state.dataResults} striped hover>
      <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden autoValue={true}>id</TableHeaderColumn>
      <TableHeaderColumn dataField='username'>Username</TableHeaderColumn>
      <TableHeaderColumn dataField='email'>Email</TableHeaderColumn>
      </BootstrapTable>
      </div>
    );
  }

}

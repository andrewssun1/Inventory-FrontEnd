var React = require('react');

import {Button} from 'react-bootstrap';
import { checkAuthAndAdmin, restRequest, handleErrors} from '../Utilities';

export default class InstaButtons extends React.Component {

  constructor(props){
    super(props);
    this.state = {

    }
    this.makeDisbursement = this.makeDisbursement.bind(this);
    this.makeLoan = this.makeLoan.bind(this);
    this.instantRequest = this.instantRequest.bind(this);
  }

  makeDisbursement() {
    this.instantRequest("disbursement");
  }

  makeLoan() {
    this.instantRequest("loan");
  }

  instantRequest(type) {
    let requestBody = {
      "owner_id": this.props.id,
      "asset_id": this.props.row.id,
      "current_type": type
    }
    let jsonResult = JSON.stringify(requestBody);
    restRequest("POST", "/api/request/instantRequest/", "application/json", jsonResult,
    (responseText)=>{
      var response = JSON.parse(responseText);
      console.log("Getting insta response");
      console.log(response);
      this.props.updateCallback.requestAssets();
      this.props.updateCallback._alertchild.generateSuccess("Successfully made dispensement");
    },
    (status, errResponse)=>{
      handleErrors(errResponse, this.props.alertchild);
    }
  );
  }

  render(){
    return (
      <div>
      <Button onClick={this.makeDisbursement} bsStyle="primary">Disburse</Button>
      <Button onClick={this.makeLoan} bsStyle="warning">Loan</Button>
      </div>
    );
  }
}

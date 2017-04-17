var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
import {restRequest, checkAuthAndAdmin} from "../Utilities.js"
import { Button } from 'react-bootstrap';
var moment = require('moment');



export default class BackfillDetailTable extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      data: []
    }
    this.stateBackfill = this.stateBackfill.bind(this);
    this.renderDenyApprove = this.renderDenyApprove.bind(this);
    this.renderSatisfyFail = this.renderSatisfyFail.bind(this);
  }

  formatPDF(cell, row){
    return (
      <Button bsStyle="link" href={row.pdf_url}>Download PDF</Button>
    );
  }

  stateBackfill(type, row){
    checkAuthAndAdmin(()=>{
      restRequest("PATCH", "/api/request/backfill/" + type + "/" + row.id + "/",  "application/json", null,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    var backfillMap = {"approve": "backfill_transit",
                               "deny": "backfill_denied",
                               "fail": "backfill_failed",
                               "satisfy": "backfill_satisfied"};
                    row.status = backfillMap[type];
                    this.forceUpdate();
                    this.props.cb.closeModal();
                  }, ()=>{});
    });
  }

  renderDenyApprove(cell, row){
    return(
      row.status === "backfill_request" ?
      <div>
        <Button bsStyle="success" onClick={()=>{this.stateBackfill("approve", row)}}>Approve</Button>
        <Button bsStyle="danger" onClick={()=>{this.stateBackfill("deny", row)}}>Deny</Button>
      </div> : null
    )
  }

  renderSatisfyFail(cell, row){
    return(
      row.status === "backfill_transit" ?
      <div>
        <Button bsStyle="success" onClick={()=>{this.stateBackfill("satisfy", row)}}>Satisfy</Button>
        <Button bsStyle="danger" onClick={()=>{this.stateBackfill("fail", row)}}>Fail</Button>
      </div> :
      null
    )
  }

  render(){
    return(
      <div>
      <BootstrapTable ref="backfillTable" data={this.props.data} striped hover>
      <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden>id</TableHeaderColumn>
      <TableHeaderColumn dataField='status'>Status</TableHeaderColumn>
      <TableHeaderColumn dataField='timestamp'>Timestamp</TableHeaderColumn>
      <TableHeaderColumn dataField='quantity'>Quantity</TableHeaderColumn>
      <TableHeaderColumn dataField='pdf_url' dataAlign="center" dataFormat={this.formatPDF}>PDF</TableHeaderColumn>
      <TableHeaderColumn dataField='denyApprove' dataAlign="center" dataFormat={this.renderDenyApprove} hidden={!(this.props.requestState === "fulfilled")}></TableHeaderColumn>
      <TableHeaderColumn dataField='satisfyFail' dataAlign="center" dataFormat={this.renderSatisfyFail} hidden={!(this.props.requestState === "fulfilled" || this.props.requestState === "approved")}></TableHeaderColumn>
      </BootstrapTable>
      </div>
    );
  }


}

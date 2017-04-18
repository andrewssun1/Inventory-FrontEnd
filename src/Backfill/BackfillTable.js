var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
import {restRequest, checkAuthAndAdmin} from "../Utilities.js"
import {Button} from 'react-bootstrap'
import AlertComponent from "../AlertComponent";
import ViewRequestModal from '../Requests//ViewRequestModal';
var moment = require('moment');


export default class BackfillTable extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      data: [],
      backfill_status: "",
      currentFilterURL: "",
      currentPage: 1,
      totalDataSize: 0,
    }
    this.filterFields = {
      status: {
        0: 'backfill_request',
        1: 'backfill_transit',
        2: 'backfill_satisfied',
        3: 'backfill_denied',
        4: 'backfill_failed'
      }
    };
    this.onRowClick = this.onRowClick.bind(this);
    this.resetTable = this.resetTable.bind(this);
    this.stateBackfill = this.stateBackfill.bind(this);
    this.getAllBackfills = this.getAllBackfills.bind(this);
    this.renderDenyApprove = this.renderDenyApprove.bind(this);
    this.renderSatisfyFail = this.renderSatisfyFail.bind(this);
    this.cleanFilter = this.cleanFilter.bind(this);

  }

  componentWillMount(){
    this.resetTable();
  }
  cleanFilter() {
    if(this._statusFilter != null) {
      console.log("Cleaning filter");
      this._statusFilter.cleanFiltered();
    }
  }
  resetTable(){
    this.getAllBackfills();
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

  formatPDF(cell, row){
    return (
      <Button bsStyle="link" href={row.pdf_url}>Download PDF</Button>
    );
  }

  getAllBackfills() {
    // Get all disbursements
    checkAuthAndAdmin(()=>{
      restRequest("GET", "/api/request/backfill/"+"?status="+this.state.backfill_status, "application/json", null,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    for (var i = 0; i < response.results.length; i++) {
                      response.results[i].timestamp = moment(response.results[i].timestamp).format('lll');
                    }
                    this.setState({
                      data: response.results,
                      totalDataSize: response.count
                    });
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

  onFilterChange(filterObj) {
    if (Object.keys(filterObj).length === 0) {
      this.setState({
        backfill_status: ""
      }, this.getAllBackfills());
    }
    else{
      if(filterObj.status !== null){
        this.setState({
          backfill_status: this.filterFields.status[filterObj.status.value]
        },
        this.getAllBackfills());
      }
    }
  }

  onPageChange(page, sizePerPage) {
    this.setState({
      currentPage: page
    }, this.getAllBackfills())
  }


  onRowClick(row){
    console.log(row);
    this._requestModal.setState({id: row.id});
    this._requestModal.openModal();
  }

  render(){
    // disburser name, receiver name, comment, onClick -> openModal
    const options = {
      onRowClick: this.onRowClick,
      onFilterChange: this.onFilterChange.bind(this),
      onPageChange: this.onPageChange.bind(this),
      sizePerPageList: [ 30 ],
      sizePerPage: 30,
      page: this.state.currentPage,
    };

      return(
        <div>
        <ViewRequestModal
        updateCallback={this}
        ref={(child) => { this._requestModal = child; }} />
        <BootstrapTable ref="backfillTable"
        remote={ true }
        pagination={ true }
        fetchInfo={ { dataTotalSize: this.state.totalDataSize } }
        data={this.state.data} options={options} striped hover>
        <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden>id</TableHeaderColumn>
        <TableHeaderColumn dataField='cart_id' hiddenOnInsert hidden>cart_id</TableHeaderColumn>
        <TableHeaderColumn dataField='status' filter={ { type: 'SelectFilter', defaultValue: this.state.currentValue, options: this.filterFields.status } }>Status</TableHeaderColumn>
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

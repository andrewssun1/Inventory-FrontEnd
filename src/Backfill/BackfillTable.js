var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
import {restRequest, checkAuthAndAdmin, handleErrors} from "../Utilities.js"
import {Button} from 'react-bootstrap'
import AlertComponent from "../AlertComponent";
import ViewRequestModal from '../Requests//ViewRequestModal';
import SelectAssetsModal from "../Requests/SelectAssetsModal.js"
import SelectionType from '../Requests/SelectionEnum.js';
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
      showModal: true
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
    this.renderBackfillState = this.renderBackfillState.bind(this);
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
      if (type === "satisfy" && row.is_asset) {
        this._selectAssetsModal.setState({type: "loan"});
        this._selectAssetsModal.setState({dispensementID: row.loan_id});
        this._selectAssetsModal.setState({backfillID: row.id});
        this._selectAssetsModal.setState({numAssetsNeeded: row.quantity});
        this._selectAssetsModal.setState({selectionType: SelectionType.SATISFY});
        this._selectAssetsModal.openModal();
      } else {
      restRequest("PATCH", "/api/request/backfill/" + type + "/" + row.id + "/",  "application/json", null,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    var backfillMap = {"approve": "backfill_transit",
                               "deny": "backfill_denied",
                               "fail": "backfill_failed",
                               "satisfy": "backfill_satisfied"};
                    row.status = backfillMap[type];
                    this.forceUpdate();
                    this._alertchild.generateSuccess("Successfully satisfied");
                  }, (status, errResponse)=>{
                    handleErrors(errResponse, this._alertchild);
                  });
      }
    });
  }


    didFinishSelection() {
      this._alertchild.generateSuccess("Successfully satisfied");
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
                      this.getRequestStatus(response.results[i]);
                    }
                    this.setState({
                      data: response.results,
                      totalDataSize: response.count
                    });
                  }, ()=>{});
    });
  }

  getRequestStatus(row){
    checkAuthAndAdmin(()=>{
      restRequest("GET", "/api/request/"+row.cart_id, "application/json", null,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    row.request_status = response.status;
                    // console.log(row);
                    this.forceUpdate();
                  }, ()=>{console.log("Get detailed request failed!");}
                  )
      });
  }

  renderBackfillState(cell, row){
    if (row.request_status === "fulfilled" && row.status === "backfill_request") {
      return(
      <div id="type1" onClick={()=>{this.state.showModal=false}}>
        <Button bsStyle="success" onClick={()=>{this.stateBackfill("approve", row)}}>Approve</Button>
        <Button bsStyle="danger" onClick={()=>{this.stateBackfill("deny", row)}}>Deny</Button>
      </div>);
    }
    else if (row.status === "backfill_transit" && (row.request_status === "fulfilled" || row.request_status === "approved")) {
      return(<div id="type2" onClick={()=>{this.state.showModal=false}}>
        <Button bsStyle="success" onClick={()=>{this.stateBackfill("satisfy", row)}}>Satisfy</Button>
        <Button bsStyle="danger" onClick={()=>{this.stateBackfill("fail", row)}}>Fail</Button>
      </div>);
    }
    return null;
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
    console.log(this.state.showModal);
    if (this.state.showModal){
      this._requestModal.setState({id: row.cart_id});
      this._requestModal.openModal();
    }
    else{
      this.setState({showModal: true});
    }

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

    const isStaff = (localStorage.isStaff === "true");
      return(
        <div>
        <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
        <ViewRequestModal
        updateCallback={this}
        ref={(child) => { this._requestModal = child; }} />
        <SelectAssetsModal updateCallback={this}
        ref={(child) => { this._selectAssetsModal = child; }}/>
        <BootstrapTable ref="backfillTable"
        remote={ true }
        pagination={ true }
        fetchInfo={ { dataTotalSize: this.state.totalDataSize } }
        data={this.state.data} options={options} striped hover>
        <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden>id</TableHeaderColumn>
        <TableHeaderColumn dataField='cart_id' hiddenOnInsert hidden>cart_id</TableHeaderColumn>
        <TableHeaderColumn dataField='cart_owner'>Cart Owner</TableHeaderColumn>
        <TableHeaderColumn dataField='status' filter={ { type: 'SelectFilter', defaultValue: this.state.currentValue, options: this.filterFields.status } }>Status</TableHeaderColumn>
        <TableHeaderColumn dataField='timestamp'>Timestamp</TableHeaderColumn>
        <TableHeaderColumn dataField='quantity'>Quantity</TableHeaderColumn>
        <TableHeaderColumn dataField='pdf_url' dataAlign="center" dataFormat={this.formatPDF}>PDF</TableHeaderColumn>
        <TableHeaderColumn dataField='denyApprove' dataAlign="center" dataFormat={this.renderBackfillState} hidden={!isStaff}></TableHeaderColumn>
        </BootstrapTable>
        </div>
      );
  }


}

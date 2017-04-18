var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
import RequestButton from "./RequestButton";
import ViewRequestModal from './ViewRequestModal.js';
import {restRequest, checkAuthAndAdmin} from "../Utilities.js"
import Select from 'react-select';
var moment = require('moment');
import AlertComponent from "../AlertComponent"
import {Row, Col} from 'react-bootstrap'

class RequestTable extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      data: [],
      totalDataSize: 0,
      __loginState: true,
      currentFilterURL: null,
      currentSearchURL: null,
      currentPage: 1,
      unselectable: [],
      selected: [],
      showModal: false,
      selectedRequest: 0,
      currentValue: null,
      currentBackfillStatus: "",
      filterStatus: "",
      searchStatus: "",
      backfill_statuses: [
        {label: "backfill_request", value: "backfill_request"},
        {label: "backfill_transit", value: "backfill_transit"},
        {label: "backfill_satisfied", value: "backfill_satisfied"},
        {label: "backfill_failed", value: "backfill_failed"},
        {label: "backfill_denied", value: "backfill_denied"},
        {label: "backfill_cancelled", value: "backfill_cancelled"},
      ]
    }

    this.filterFields = {
      status: {
        0: 'outstanding',
        1: 'approved',
        2: 'denied',
        3: 'fulfilled'
      }
    };
    this.getAllRequest = this.getAllRequests.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
    this.resetTable = this.resetTable.bind(this);
    this.cleanFilter = this.cleanFilter.bind(this);
    this.handleBackfillStatusChange = this.handleBackfillStatusChange.bind(this);
  }

  componentWillMount(){
    this.getAllRequests(null);
  }

  resetTable(){
    this.getAllRequests(null);
    this.setState({selectedRequest: 0});
    this.cleanFilter();
  }

  cleanFilter() {
    if(this._statusFilter != null) {
      console.log("Cleaning filter");
      this._statusFilter.cleanFiltered();
    }
  }

  getAllRequests(){
    // var url = url_parameter === null ? "/api/request/" : "/api/request/" + url_parameter;
    // console.log(url);
    checkAuthAndAdmin(()=>{
      restRequest("GET", "/api/request/?status=" + this.state.filterStatus + "&page=" + this.state.currentPage + "&search="+this.state.searchStatus + "&cart_loans__backfill_loan__status=" + this.state.currentBackfillStatus, "application/json", null,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    // console.log(response);
                    var unselectable_ids = [];
                    var response_results = RequestTable.editGetResponse(response.results, unselectable_ids);
                    // console.log(response_results);
                    for (var i = 0; i < response_results.length; i++){
                      var currRequest = response_results[i];
                      if (currRequest.cart_disbursements.length !== 0 && currRequest.cart_loans.length !== 0) {
                        currRequest.type = "both";
                      }
                      else if (currRequest.cart_disbursements.length !== 0 ) {
                        currRequest.type = "disbursement";
                      }
                      else {
                        currRequest.type = "loan";
                      }
                    }
                    this.setState({
                      data: response_results,
                      totalDataSize: response.count,
                      unselectable: unselectable_ids,
                      selected: []
                    });
                  }, ()=>{});
    });
  }

  static editGetResponse(data,unselectable_arr) {
    // console.log(data);
    for(var index=0; index< data.length; index++){
      data[index]['owner'] = data[index].owner === null ? 'UNKNOWN USER' : data[index].owner;
      data[index]['timestamp'] = moment(data[index].timestamp).format('lll');
      if(data[index]['status']!=='outstanding'){
        unselectable_arr.push(data[index]['id'])
      }
    }
    return data;
  }

  onPageChange(page, sizePerPage) {
    // var page_argument = "page=" + page;
    // var url_param = this.state.currentFilterURL === null ? "?" + page_argument : this.state.currentFilterURL + "&" + page_argument;
    // url_param = this.state.currentSearchURL === null ? url_param : url_param + this.state.currentFilterURL + "&" + page_argument;
    this.setState({
      currentPage: page
    }, ()=>{ this.getAllRequests()});
  }

  onRowSelect(row, isSelected, e) {
    var selected_ids = this.state.selected;
    if(isSelected){
      selected_ids.push(row.id)
    }
    else{
      var index = selected_ids.indexOf(row.id);
      if (index > -1) {
        selected_ids.splice(index, 1);
      }
    }
    this.setState({
      selected: selected_ids
    })
  }

  onSelectAll(isSelected, rows) {
    if(isSelected){
      var selected_ids = rows.map(row => row.id);
      this.setState({
        selected: selected_ids
      })
    }
    else{
      this.setState({
        selected: []
      })
    }
  }

  onSearchChange(searchText, colInfos, multiColumnSearch) {
    if(searchText===''){
      this.setState({
        searchStatus: "",
        currentPage: 1
      }, ()=>{this.getAllRequests()});
    }
    else{
      this.setState({
        searchStatus: searchText,
        currentPage: 1
      }, ()=>{this.getAllRequests()});
    }
  }

  onFilterChange(filterObj) {
    if (Object.keys(filterObj).length === 0) {
      this.setState({
        filterStatus: "",
        currentPage: 1
      }, ()=>{this.getAllRequests()});
    }
    else{
      // var url_parameter = "?";
      if(filterObj.status !== null){
        this.setState({
          filterStatus: this.filterFields.status[filterObj.status.value],
          currentPage: 1
        }, ()=>{this.getAllRequests()});
      }
    }
  }

  handleBackfillStatusChange(value){
    console.log(value);
    this.setState({currentBackfillStatus: (value === null) ? "" : value, currentPage: 1}, ()=>{
      this.getAllRequests()
    })
  }

  onRowClick(row, isSelected, e) {
    // console.log(row.id);
    this._requestModal.setState({id: row.id})
    this._requestModal.openModal();
  }

  render() {
    const options = {
      onPageChange: this.onPageChange.bind(this),
      sizePerPageList: [ 30 ],
      sizePerPage: 30,
      page: this.state.currentPage,
      onSearchChange: this.onSearchChange.bind(this),
      searchDelayTime: 500,
      clearSearch: true,
      onFilterChange: this.onFilterChange.bind(this),
      onRowClick: this.onRowClick
    };

    const selectRowProp = {
      mode: 'checkbox',
      clickToSelect: false,
      selected: this.state.selected,
      unselectable: this.state.unselectable,
      onSelect: this.onRowSelect.bind(this),
      onSelectAll: this.onSelectAll.bind(this),
    };

    return(
      <div>
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      <ViewRequestModal id={this.state.selectedRequest}
      updateCallback={this}
      ref={(child) => { this._requestModal = child; }} />
      <Select simpleValue
            value={this.state.currentBackfillStatus}
            placeholder="Filter by backfill status"
            options={this.state.backfill_statuses}
            onChange={this.handleBackfillStatusChange}
            style={{width: "200px", marginLeft: "10px"}} />
      <RequestButton ref="requestButton" { ...this.state} cb={this}/>
      <BootstrapTable ref="logTable"
      data={ this.state.data }
      remote={ true }
      pagination={ true }
      search={ true }
      fetchInfo={ { dataTotalSize: this.state.totalDataSize } }
      options={ options }
      selectRow={ selectRowProp }
      striped hover>
      <TableHeaderColumn dataField='id' isKey hidden autoValue="true">Id</TableHeaderColumn>
      <TableHeaderColumn dataField='owner' width="150px">Requesting User</TableHeaderColumn>
      <TableHeaderColumn dataField='status' width="150px" filter={ { type: 'SelectFilter', defaultValue: this.state.currentValue, options: this.filterFields.status } }
      ref={(child) => { this._statusFilter = child; }} editable={ false }>Status</TableHeaderColumn>
    <TableHeaderColumn dataField='staff' width="150px"> Associated Staff </TableHeaderColumn>
      <TableHeaderColumn dataField='timestamp' width="170px"  editable={ false }>Timestamp</TableHeaderColumn>
      <TableHeaderColumn dataField='reason' >Reason</TableHeaderColumn>
      <TableHeaderColumn dataField='type' >Type (Disbursement/Loan/Both)</TableHeaderColumn>
      </BootstrapTable>
      </div>
    )
  }

}

export default RequestTable;

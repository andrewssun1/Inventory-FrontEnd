var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
import RequestButton from "./RequestButton";
import ViewRequestModal from './ViewRequestModal.js';
import {hashHistory} from "react-router";
import {restRequest, checkAuthAndAdmin} from "../Utilities.js"
var moment = require('moment');
//var xhttp = new XMLHttpRequest();

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
      selectedRequest: 0
    }

    this.filterFields = {
      status: {
        0: 'outstanding',
        1: 'approved',
        2: 'denied'
      }
    };
    this.getAllRequest = this.getAllRequests.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
    this.resetTable = this.resetTable.bind(this);
  }

  componentWillMount(){
    this.getAllRequests(null);
  }

  resetTable(){
    this.getAllRequests(null);
    this.setState({selectedRequest: 0});
  }

  getAllRequests(url_parameter){
    var url = url_parameter === null ? "/api/request/" : "/api/request/" + url_parameter;
    checkAuthAndAdmin(()=>{
      restRequest("GET", url, "application/json", null,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    console.log(response);
                    var unselectable_ids = [];
                    var response_results = RequestTable.editGetResponse(response.results, unselectable_ids);
                    this.setState({
                      data: response_results,
                      totalDataSize: response.count,
                      unselectable: unselectable_ids
                    });
                  }, ()=>{});
    });
    // xhttp.open("GET", url, false);
    // xhttp.setRequestHeader("Content-Type", "application/json");
    // xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
    // xhttp.send();
    // if (xhttp.status === 401 || xhttp.status === 500){
    //   if(!!localStorage.token){
    //     delete localStorage.token;
    //   }
    //   this.setState({
    //     _loginState: false
    //   });
    //   hashHistory.push('/login');
    //   return null;
    // }
    // else{
    //   var response = JSON.parse(xhttp.responseText);
    //   var unselectable_ids = [];
    //   var response_results = RequestTable.editGetResponse(response.results, unselectable_ids);
    //   this.setState({
    //     data: response_results,
    //     totalDataSize: response.count,
    //     unselectable: unselectable_ids
    //   });
    // }
  }

  static editGetResponse(data,unselectable_arr) {
    for(var index=0; index< data.length; index++){
      data[index]['item_name'] = data[index]['item'] === null ? 'UNKNOWN ITEM' : data[index]['item']['name'];
      data[index]['timestamp'] = moment(data[index].timestamp).format('lll');
      if(data[index]['status']!=='outstanding'){
        unselectable_arr.push(data[index]['id'])
      }
    }
    return data;
  }

  onPageChange(page, sizePerPage) {
    var page_argument = "page=" + page;
    var url_param = this.state.currentFilterURL === null ? "?" + page_argument : this.state.currentFilterURL + "&" + page_argument;
    url_param = this.state.currentSearchURL === null ? url_param : url_param + this.state.currentFilterURL + "&" + page_argument;
    this.getAllRequests(url_param);
    this.setState({
      currentPage: page
    })
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
        currentSearchURL: null
      });
      this.getAllRequests();
    }
    else{
      var url_parameter = "?search=" + searchText;
      this.setState({
        currentSearchURL: url_parameter
      });
      this.getAllRequests(url_parameter);
    }
  }

  onFilterChange(filterObj) {
    if (Object.keys(filterObj).length === 0) {
      this.setState({
        currentFilterURL: null
      });
      this.getAllRequests(null)
    }
    else{
      var url_parameter = "?";
      if(filterObj.status !== null){
        url_parameter = url_parameter + "status=" + this.filterFields.status[filterObj.status.value];
      }
      this.getAllRequests(url_parameter)
    }
  }

  onRowClick(row, isSelected, e) {
    console.log(this._requestModal.state.requestData);
    console.log(row.id);
    this._requestModal.getDetailedRequest(row.id, ()=>{
      this._requestModal.openModal();
    });
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
      unselectable: this.state.unselectable,
      onSelect: this.onRowSelect.bind(this),
      onSelectAll: this.onSelectAll.bind(this),
    };

    return(
      <div>
      <ViewRequestModal id={this.state.selectedRequest}
      updateCallback={this.props.updateCallback}
      ref={(child) => { this._requestModal = child; }} />
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
      <TableHeaderColumn dataField='item_name' width="150px">Item</TableHeaderColumn>
      <TableHeaderColumn dataField='quantity' width="80px">Quantity</TableHeaderColumn>
      <TableHeaderColumn dataField='status' width="150px" filter={ { type: 'SelectFilter', options: this.filterFields.status } } editable={ false }>Status</TableHeaderColumn>
      <TableHeaderColumn dataField='timestamp' width="170px"  editable={ false }>Timestamp</TableHeaderColumn>
      <TableHeaderColumn dataField='reason' >Reason</TableHeaderColumn>
      </BootstrapTable>
      </div>
    )
  }

}

export default RequestTable;

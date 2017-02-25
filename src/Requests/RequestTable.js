var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
import RequestButton from "./RequestButton";
import ViewRequestModal from './ViewRequestModal.js';
import {restRequest, checkAuthAndAdmin} from "../Utilities.js"
var moment = require('moment');
import AlertComponent from "../AlertComponent"

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
        2: 'denied',
        3: 'active'
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
    var url = url_parameter === null ? "/api/shoppingCart/" : "/api/shoppingCart/" + url_parameter;
    console.log(url);
    checkAuthAndAdmin(()=>{
      restRequest("GET", url, "application/json", null,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    console.log(response);
                    var unselectable_ids = [];
                    var response_results = RequestTable.editGetResponse(response.results, unselectable_ids);
                    console.log(response_results);
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
    console.log(data);
    for(var index=0; index< data.length; index++){
      data[index]['item_name'] = data[index].owner.username === null ? 'UNKNOWN USER' : data[index].owner.username;
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
      this.getAllRequests(null);
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
      <TableHeaderColumn dataField='item_name' width="150px">Requesting User</TableHeaderColumn>
      <TableHeaderColumn dataField='status' width="150px" filter={ { type: 'SelectFilter', options: this.filterFields.status } } editable={ false }>Status</TableHeaderColumn>
      <TableHeaderColumn dataField='timestamp' width="170px"  editable={ false }>Timestamp</TableHeaderColumn>
      <TableHeaderColumn dataField='reason' >Reason</TableHeaderColumn>
      </BootstrapTable>
      </div>
    )
  }

}

export default RequestTable;

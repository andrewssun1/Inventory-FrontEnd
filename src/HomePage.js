var React = require('react');
var ReactBsTable = require('react-bootstrap-table');

var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;

import {Button} from 'react-bootstrap';
import AlertComponent from './AlertComponent'
import ViewRequestModal from './Requests/ViewRequestModal'
import Select from 'react-select';
import './DropdownTable.css';

var moment = require('moment');

// import { hashHistory } from 'react-router';
import { checkAuthAndAdmin, restRequest } from './Utilities';

export default class HomePage extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      loan_data: [],
      outstanding_data: [],
      disbursement_data: [],
      currentPageLoan: 1,
      currentPageRequest: 1,
      currentSearchURL: null,
      users: [],
      item_names: [],
      selectedUser: "",
      currentItem: ""
    }
    this.getAllLoans = this.getAllLoans.bind(this);
    this.getOutstanding = this.getOutstanding.bind(this);
    this.onPageChangeLoan = this.onPageChangeLoan.bind(this);
    this.renderHomePageTable = this.renderHomePageTable.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.getUserFilter = this.getUserFilter.bind(this);
    this.getItemFilter = this.getItemFilter.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
  }

  componentWillMount(){
      this.getAllLoans();
      this.getOutstanding();
      checkAuthAndAdmin(()=>{
      restRequest("GET", "/api/user/large/", "application/JSON", null,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    for (var i = 0; i < response.results.length; i++){
                      var username = response.results[i].username;
                      this.state.users.push({label: username, value: username});
                    }
                  }, ()=>{});
        restRequest("GET", "/api/item/unique/", "application/json", null,
                    (responseText)=>{
                      var response = JSON.parse(responseText);
                      var items = [];
                      for (var i=0; i<response.results.length; i++){
                        var currItemName = response.results[i].name;
                        items.push({label: currItemName, value: currItemName});
                      }
                      this.setState({
                        item_names: items
                      });
                    }, ()=>{})
                  });
  }

  getAllLoans(){
    checkAuthAndAdmin(()=>{
      var url =  "/api/request/loan/" + "?item__name="+this.state.currentItem
                + "&cart__owner__username="+this.state.selectedUser
                + "&cart__status=fulfilled"
                + "&returned=false"
                + "&page="+this.state.currentPageLoan;
      restRequest("GET", url, "application/JSON", null,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    console.log(response);
                    for (var i = 0; i < response.results.length; i++) {
                      response.results[i].item_name = response.results[i].item.name;
                    }
                    this.setState({loan_data: response.results, totalLoanSize: response.count});
                    console.log(response.count)
                  }, (status, responseText)=>{console.log(JSON.parse(responseText))});
    });
  }

  getOutstanding(){
    checkAuthAndAdmin(()=>{
      //get all outstanding requests
      var url = "/api/request/?status=outstanding";
      restRequest("GET", url, "application/JSON", null,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    console.log(response);
                    for (var i = 0; i < response.results.length; i++) {
                      response.results[i]['timestamp'] = moment(response.results[i].timestamp).format('lll');
                    }
                    this.setState({outstanding_data: response.results});
                  }, (status, responseText)=>{console.log(JSON.parse(responseText))});
    })
  }


  onRowClick(row){
    this._viewRequestModal.getDetailedRequest(row.cart_id, ()=>{
      this._viewRequestModal.openModal();
    });
  }

  onPageChangeLoan(page, sizePerPage){
    var page_argument = "page=" + page;
    var url_param = "?" + page_argument;
    console.log(url_param);
    this.getAllLoans();
    this.setState({
        currentPageLoan: page
    })
  }


  handleSelectChange(value){
    value = (value === null) ? "" : value;
    this.setState({currentPageLoan: 1,
                  selectedUser: value}, ()=>{
                    this.getAllLoans();
                  });
  }

  handleNameChange(value){
    value = (value === null) ? "" : value;
    this.setState({currentPageLoan: 1,
                  currentItem: value}, ()=>{
                    this.getAllLoans();
                  });
  }

  getUserFilter(filterHandler, customFilterParameters){
    return <Select simpleValue
                   value={this.state.selectedUser}
                   placeholder="Select"
                   options={this.state.users}
                   onChange={(value)=>{this.handleSelectChange(value)}} />
  }

  getItemFilter(filterHandler, customFilterParameters){
    return (
      <Select simpleValue
            value={this.state.currentItem}
            placeholder="Filter by item name"
            options={this.state.item_names}
            onChange={this.handleNameChange}
             />
    )
  }


  renderHomePageTable(data){
    const options = {
      onRowClick: this.onRowClick.bind(this),
      onPageChange: this.onPageChangeLoan.bind(this),
      sizePerPageList: [ 30 ],
      sizePerPage: 30,
      page: this.state.currentPageLoan
    }

    const isStaff = (localStorage.isStaff === "true");
    return(
      <div>
      <ViewRequestModal ref={(child) => { this._viewRequestModal = child; }} updateCallback={this} />
      <BootstrapTable ref="loanTable"
                      data={ data }
                      options={options}
                      pagination={ true }
                      remote= {true}
                      fetchInfo={ { dataTotalSize: this.state.totalLoanSize } }
                      striped hover>
                      <TableHeaderColumn dataField='cart_id' isKey hidden autoValue="true">cart_id</TableHeaderColumn>
                      <TableHeaderColumn dataField='cart_owner' className='my-class' filter={!isStaff ? null : { type: 'CustomFilter', getElement: this.getUserFilter, customFilterParameters: {type: "initiating"} }}>Requesting User</TableHeaderColumn>
                      <TableHeaderColumn dataField='item_name' className='my-class' filter={{ type: 'CustomFilter', getElement: this.getItemFilter, customFilterParameters: {type: "initiating"} }}>Item</TableHeaderColumn>
                      <TableHeaderColumn dataField='quantity' >Quantity</TableHeaderColumn>
                      <TableHeaderColumn dataField='returned_quantity'>Returned</TableHeaderColumn>
      </BootstrapTable>
      </div>
    );
  }

  onOutstandingClick(row){
    this._viewRequestModal.getDetailedRequest(row.id, ()=>{
      this._viewRequestModal.openModal();
    });
  }

  renderOutstandingTable(data){
    const options = {
      onRowClick: this.onOutstandingClick.bind(this),
    }
    return(
    <BootstrapTable ref="loanTable"
                    data={ data }
                    striped hover
                    options={options}>
                    <TableHeaderColumn dataField='id' isKey hidden autoValue="true">id</TableHeaderColumn>
                    <TableHeaderColumn dataField="owner">Requesting User</TableHeaderColumn>
                    <TableHeaderColumn dataField='status'>Status</TableHeaderColumn>
                    <TableHeaderColumn dataField='timestamp'>Timestamp</TableHeaderColumn>
    </BootstrapTable>);
  }

  render(){
    const isStaff = (localStorage.isStaff === "true");
    return(
      <div>
        <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
        <p><b>Current unreturned loans: </b></p>
        {this.renderHomePageTable(this.state.loan_data)}
        <p><b>Current outstanding requests: </b></p>
        {this.renderOutstandingTable(this.state.outstanding_data)}
      </div>
    );
  }



}

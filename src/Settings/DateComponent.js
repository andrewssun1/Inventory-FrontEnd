import React from "react";
import {checkAuthAndAdmin, restRequest} from "../Utilities.js";
import {Button} from 'react-bootstrap';

import DatePicker from 'rc-calendar/lib/Picker';
import Calendar from 'rc-calendar';
import moment from 'moment';
import enUS from 'rc-calendar/lib/locale/en_US';
import AlertComponent from '../AlertComponent';

var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;

export default class DateComponent extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      minTime: "",
      maxTime: "",
      currentPage: 1,
      scheduledEmailDates: null
    }
    this.addDate = this.addDate.bind(this);
    this.getScheduledEmailDates = this.getScheduledEmailDates.bind(this);
    this.renderScheduledEmailDates = this.renderScheduledEmailDates.bind(this);
    this.onDeleteRow = this.onDeleteRow.bind(this);
    this.deletedRowsContainsIndex = this.deletedRowsContainsIndex.bind(this);
  }

  componentWillMount() {
    this.getScheduledEmailDates();
  }

  addDate() {
    if(this.state.scheduledEmailDates == null) return null;
    var requestBody = [];
    for(var i = 0; i < this.state.scheduledEmailDates.length; i ++) {
      requestBody.push({"date" : this.state.scheduledEmailDates[i].date});
    }
    requestBody.push({"date" : this._calendar.state.selectedValue.format('YYYY-MM-DD')});
    var jsonResult = JSON.stringify(requestBody);
    restRequest("POST", "/api/email/loanReminderDates/modify/", "application/json", jsonResult,
    (responseText)=>{
      this.getScheduledEmailDates();
    }, (status, errResponse)=>{
      this._alertchild.generateError("There was an error adding dates. Please make sure you are not adding an date which has already been scheduled.");
    });
  }

  getScheduledEmailDates() {
    restRequest("GET", "/api/email/loanReminderDates/", "application/json", null,
    (responseText)=>{
      this.setState({scheduledEmailDates: JSON.parse(responseText).results});
    }, ()=>{
      this._alertchild.generateError("There was an error getting the scheduled dates");
    });
  }

  onDeleteRow(rows) {
    if(this.state.scheduledEmailDates == null) return null;
    var requestBody = [];
    for(var i = 0; i < this.state.scheduledEmailDates.length; i ++) {
      if(!this.deletedRowsContainsIndex(rows, i)) {
        requestBody.push({"date" : this.state.scheduledEmailDates[i].date});
      }
    }
    var jsonResult = JSON.stringify(requestBody);
    restRequest("POST", "/api/email/loanReminderDates/modify/", "application/json", jsonResult,
    (responseText)=>{
      this.getScheduledEmailDates();
    }, ()=>{
      this._alertchild.generateError("There was an error deleting dates");
    });
  }

  deletedRowsContainsIndex(rows, index) {
    for(var i = 0; i < rows.length; i ++) {
      if(this.state.scheduledEmailDates[index].id == rows[i]) {
        return true;
      }
    }
    return false;
  }

  renderScheduledEmailDates() {
    if(this.state.scheduledEmailDates == null) return null;

    const selectRow = {
      mode: 'checkbox'
    }
    const options = {
      onDeleteRow: this.onDeleteRow
    }

    return(
    <BootstrapTable ref="subscribedManagersTable" data={this.state.scheduledEmailDates}
    options={options} deleteRow={true} selectRow={selectRow} striped hover>
    <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden autoValue={true}>id</TableHeaderColumn>
    <TableHeaderColumn dataField='date'>Date</TableHeaderColumn>
    <TableHeaderColumn dataField='executed'>Executed</TableHeaderColumn>
    </BootstrapTable>);
  }

  render(){
    const format = 'YYYY-MM-DD';
    const now = moment();

    return(
      <div>
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      <h4> Scheduled Email Dates </h4>
      {this.renderScheduledEmailDates()}
      <br/>
      <h4> Add a Date </h4>
      <Calendar
              showWeekNumber={false}
              locale={enUS}
              defaultValue={now}
              formatter={format}
              showOk={false}
              ref={child => this._calendar = child}
            />
      <Button onClick={this.addDate} bsStyle="primary">Add Date</Button>
      </div>
    );
  }

}

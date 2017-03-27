import React from "react";
import {checkAuthAndAdmin, restRequest} from "../Utilities.js";
import {Button} from 'react-bootstrap';

import DatePicker from 'rc-calendar/lib/Picker';
import Calendar from 'rc-calendar';
import moment from 'moment';
import enUS from 'rc-calendar/lib/locale/en_US';

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

    console.log(requestBody);

    var jsonResult = JSON.stringify(requestBody);

    restRequest("POST", "/api/email/loanReminderDates/modify/", "application/json", jsonResult,
    (responseText)=>{
      console.log("Successfully updated loan reminder dates!");
      console.log(JSON.parse(responseText));
      this.getScheduledEmailDates();
    }, ()=>{});
  }

  getScheduledEmailDates() {
    restRequest("GET", "/api/email/loanReminderDates/", "application/json", null,
    (responseText)=>{
      console.log("Successfully obtained loan reminder dates!");
      console.log(JSON.parse(responseText));
      this.setState({scheduledEmailDates: JSON.parse(responseText).results});
    }, ()=>{});
  }

  renderScheduledEmailDates() {
    if(this.state.scheduledEmailDates == null) return null;
    var dateText = [];
    for(var i = 0; i < this.state.scheduledEmailDates.length; i ++) {
      let date = this.state.scheduledEmailDates[i].date;
      dateText.push(<p key={date}> {date} </p>);
    }
    return dateText;
  }

  render(){
    const format = 'YYYY-MM-DD';
    const now = moment();

    return(
      <div>
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

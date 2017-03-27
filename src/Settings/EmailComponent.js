import React from "react";
import {checkAuthAndAdmin, restRequest} from "../Utilities.js";
import {Button, Label, Form, FormGroup, FormControl} from 'react-bootstrap';
import TypeConstants from '../TypeConstants.js';
import TextEntryFormElement from '../TextEntryFormElement.js';
import DateRangePicker from '../DateRangePicker.js';
import ConfigureEmailModal from './ConfigureEmailModal.js';
import SubscribedManagerTable from './SubscribedManagerTable.js';

export default class EmailComponent extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      isSubscribed : false,
      minTime: "",
      maxTime: "",
      currentPage: 1
    }
    this.subscribeManager = this.subscribeManager.bind(this);
    this.unsubscribeManager = this.unsubscribeManager.bind(this);
    this.renderSubscribeButton = this.renderSubscribeButton.bind(this);
    this.didPressConfigureEmail = this.didPressConfigureEmail.bind(this);
  }

  componentWillMount() {
    restRequest("GET", "/api/email/subscribedManagers/", "application/json", null,
                  (responseText)=>{
                    let response = JSON.parse(responseText);
                    console.log(response);
                    //TODO: is there a better way to do this?
                    var hasUsername = false;
                    for(var i = 0; i < response.results.length; i ++) {
                      if(response.results[i].member.username === localStorage.username) {
                        hasUsername = true;
                      }
                    }
                    this.setState({isSubscribed: hasUsername});
                  }, ()=>{});
  }

  didFinishChangeState(url_parameter, cb) {}

  subscribeManager() {
    console.log("Subscribe");
    restRequest("POST", "/api/email/subscribe/", "application/json", null,
                (responseText)=>{
                  console.log("Successfully Subscribed");
                  this.setState({isSubscribed: true});
                }, ()=>{});
  }

  unsubscribeManager() {
    console.log("Unsubscribe");
    restRequest("POST", "/api/email/unsubscribe/", "application/json", null,
                (responseText)=>{
                  console.log("Successfully Unsubscribed");
                  this.setState({isSubscribed: false});
                }, ()=>{});
  }

  renderSubscribeButton() {
    if(this.state.isSubscribed) {
      return (<Button onClick={this.unsubscribeManager} bsStyle="danger">Unsubscribe</Button>)
    } else {
      return (<Button onClick={this.subscribeManager} bsStyle="primary">Subscribe</Button>)
    }
    return null;
  }

  didPressConfigureEmail() {
    this._configureEmailModal.openModal();
  }

  render() {
    return(
      <div>
      {this.renderSubscribeButton()}
      <br/> <br/>
      <Button onClick={this.didPressConfigureEmail} bsStyle="primary">Configure Loan Reminder Emails</Button>
      <ConfigureEmailModal ref={child => this._configureEmailModal = child} />
      {localStorage.isSuperUser ? <SubscribedManagerTable /> : null}
      </div>
    );
  }

}

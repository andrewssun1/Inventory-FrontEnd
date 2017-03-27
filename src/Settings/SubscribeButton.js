import React from "react";
import {checkAuthAndAdmin, restRequest} from "../Utilities.js";
import {Button} from 'react-bootstrap';

export default class SubscribeButton extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      isSubscribed : false,
    }
    this.subscribeManager = this.subscribeManager.bind(this);
    this.unsubscribeManager = this.unsubscribeManager.bind(this);
    this.assignSubscriptionStatus = this.assignSubscriptionStatus.bind(this);
  }

  componentWillMount() {
    this.assignSubscriptionStatus();
  }

  assignSubscriptionStatus() {
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

  render() {
    if(this.state.isSubscribed) {
      return (<Button onClick={this.unsubscribeManager} bsStyle="danger">Unsubscribe</Button>);
    } else {
      return (<Button onClick={this.subscribeManager} bsStyle="primary">Subscribe</Button>);
    }
  }

}

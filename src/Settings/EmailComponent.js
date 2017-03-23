import React from "react";
import {checkAuthAndAdmin, restRequest} from "../Utilities.js";
import {Button, Label, Form, FormGroup, FormControl} from 'react-bootstrap';
import TypeConstants from '../TypeConstants.js';
import TextEntryFormElement from '../TextEntryFormElement.js';
import DateRangePicker from '../DateRangePicker.js';

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
  }

  componentWillMount() {
    if(localStorage.isStaff === "true") {
      //TODO: HTTP Request to get initial subscription status
    }
  }

  didFinishChangeState(url_parameter, cb) {}

  subscribeManager() {
    console.log("Subscribe");
    this.setState({isSubscribed: true});
    //TODO: HTTP Request to subscribe
  }

  unsubscribeManager() {
    console.log("Unsubscribe");
    this.setState({isSubscribed: false});
    //TODO: HTTP Request to unsubscribe
  }

  renderSubscribeButton() {
    if(this.state.isSubscribed) {
      return (<Button onClick={this.unsubscribeManager} bsStyle="danger">Unsubscribe</Button>)
    } else {
      return (<Button onClick={this.subscribeManager} bsStyle="primary">Subscribe</Button>)
    }
    return null;
  }

  render(){
    return(
      <div>
      <h2> Email </h2>
      {this.renderSubscribeButton()}
      <DateRangePicker cb={this}></DateRangePicker>
      <Form horizontal>
      <TextEntryFormElement controlId="formHorizontalSubject"
      label="Subject" type={TypeConstants.Enum.SHORT_STRING} initialValue=""
      ref={child => this._subjectElement = child}/>
      <TextEntryFormElement controlId="formHorizontalBody"
      label="Body" type={TypeConstants.Enum.LONG_STRING} initialValue=""
      ref={child => this._bodyElement = child}/>
      </Form>

      </div>
    );
  }

}

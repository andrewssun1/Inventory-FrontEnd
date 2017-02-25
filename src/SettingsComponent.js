import React from "react";
import {checkAuthAndAdmin, restRequest} from "./Utilities.js";
import {Button, Label, FormGroup, FormControl} from 'react-bootstrap';

export default class SettingsComponent extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      apiKey: ""
    };
    this.generateKey = this.generateKey.bind(this);
    this.deleteKey = this.deleteKey.bind(this);
  }

  generateKey(){
    checkAuthAndAdmin(()=>{
      restRequest("GET", "/api/user/auth/token", "application/json", null,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    this.setState({apiKey: response.token});
                  }, ()=>{});
    });
  }

  deleteKey(){
    checkAuthAndAdmin(()=>{
      restRequest("DELETE", "/api/user/auth/token", "application/json", null,
                  (responseText)=>{
                    // console.log(responseText);
                    // var response = JSON.parse(responseText);
                    this.setState({apiKey: ""});
                  }, (status, errResponse)=>{console.log(JSON.parse(errResponse))});
    });
  }

  render(){
    return(
      <div>
      <Label bsStyle="info">API Key</Label>
      <form>
        <FormGroup controlId="formBasicText" >
                  <FormControl
                    componentClass="textarea"
                    validationState="success"
                    value={this.state.apiKey}
                    placeholder="Your API key will be generated here"
                    readOnly
                  />
        </FormGroup>
      </form>
      <Button bsStyle="primary" onClick={this.generateKey}>Generate Key</Button>
      <Button bsStyle="danger" onClick={this.deleteKey}>Delete Key</Button>
      </div>
    );
  }

}

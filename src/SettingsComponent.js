import React from "react";
import {checkAuthAndAdmin, restRequest} from "./Utilities.js";
import {Button, Label, FormGroup, FormControl} from 'react-bootstrap';

export default class SettingsComponent extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      apiKey: "",
      keyIsGenerated: false
    };
    this.generateKey = this.generateKey.bind(this);
    this.deleteKey = this.deleteKey.bind(this);
    this.refreshKey = this.refreshKey.bind(this);
  }

  componentWillMount() {
    this.generateKey();
  }

  generateKey(){
    checkAuthAndAdmin(()=>{
      restRequest("GET", "/api/user/auth/token", "application/json", null,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    this.setState({apiKey: response.token});
                    this.setState({keyIsGenerated: true});
                  }, ()=>{});
    });
  }

  deleteKey(cb){
    checkAuthAndAdmin(()=>{
      restRequest("DELETE", "/api/user/auth/token", "application/json", null,
                  (responseText)=>{
                    // console.log(responseText);
                    // var response = JSON.parse(responseText);
                    this.setState({apiKey: ""});
                    this.setState({keyIsGenerated: false});
                    cb();
                  }, (status, errResponse)=>{console.log(JSON.parse(errResponse))});
    });
  }

  refreshKey() {
    this.deleteKey(this.generateKey);
  }

  render(){
    return(
      <div>
      <Label bsStyle="info">API Key</Label>
      <form>
        <FormGroup controlId="formBasicText" >
                  <FormControl
                    componentClass="textarea"
                    value={this.state.apiKey}
                    placeholder="Your API key will be generated here"
                    readOnly
                  />
        </FormGroup>
      </form>
       <Button bsStyle="primary" onClick={this.refreshKey}>Refresh Key</Button>
      </div>
    );
  }

}

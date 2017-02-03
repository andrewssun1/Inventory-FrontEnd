// LoginPage.js
// Login component for React
// @author Andrew

var React = require('react');
import {Form, FormGroup, Col, Button, ControlLabel, FormControl, Alert} from 'react-bootstrap';
import { hashHistory } from 'react-router';

export default class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      _username: "",
      _password: "",
      _alert_both: false
    }
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }
  handleUsernameChange(e) {
    this.setState({_username: e.target.value});
  }
  handlePasswordChange(e) {
    this.setState({_password: e.target.value});
  }
  createAlert(txt) {
    return (
      <Alert bsStyle="danger">
        <h4>Invalid {txt}!</h4>
      </Alert>
    )
  }

  handleClick() {
    this.setState({_alert_both: false});
    var xhttp = new XMLHttpRequest();
    var clientID = '2yCZ6QlDjFuS7ZTOwOaWCHPX7PU7s2iwWANqRFSy'
    if (this.state._username.length < 1 || this.state._password.length < 1){
      this.setState({_alert_both: true});
      return null;
    }
    var request_str = "grant_type=password&username="+this.state._username+"&password="+this.state._password+"&client_id="+clientID;
    xhttp.open("POST", "https://asap-test.colab.duke.edu/api/o/token/", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(request_str);
    var response = JSON.parse(xhttp.responseText);
    if (xhttp.status === 401 || xhttp.status === 500){
      console.log('Unauthorized!!');
      this.setState({_alert_both: true});
    }
    else{
      localStorage.token = response['access_token'];
      hashHistory.push('/userpage');
      console.log(localStorage.token);
    }
    console.log(response);
  }
  render() {

    return(
  <div>
  {this.state._alert_both ? this.createAlert("username/password") : <h3></h3>}
  <Form horizontal>
    <FormGroup controlId="formHorizontalEmail">
      <Col componentClass={ControlLabel} smOffset={3} sm={2}>
        Username
      </Col>
      <Col sm={2}>
        <FormControl type="text" placeholder="Username" onChange={this.handleUsernameChange}/>
      </Col>
    </FormGroup>

    <FormGroup controlId="formHorizontalPassword">
      <Col componentClass={ControlLabel} smOffset={3} sm={2}>
        Password
      </Col>
      <Col sm={2}>
        <FormControl type="password" placeholder="Password" onChange={this.handlePasswordChange}/>
      </Col>
    </FormGroup>

    <FormGroup>
      <Col smOffset={5} sm={2}>
        <Button type="button" onClick={this.handleClick}>
          Sign in
        </Button>
      </Col>
    </FormGroup>
  </Form>
  </div>
)
  }

}

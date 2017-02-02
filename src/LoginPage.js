// LoginPage.js
// Login component for React
// @author Andrew

var React = require('react');
var ReactDOM = require('react-dom');
import {Form, FormGroup, Col, Button, ControlLabel, FormControl} from 'react-bootstrap'

export default class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      _username: "",
      _password: ""
    }
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }
  handleUsernameChange(e) {
    this.state._username = e.target.value;
  }
  handlePasswordChange(e) {
    this.state._password = e.target.value;
  }
  handleClick() {
    // console.log(this.state._username);
    // console.log(this.state._password);
    var xhttp = new XMLHttpRequest();
    var clientID = '2yCZ6QlDjFuS7ZTOwOaWCHPX7PU7s2iwWANqRFSy'
    var request_str = "grant_type=password&username="+this.state._username+"&password="+this.state._password+"&client_id="+clientID;
    xhttp.open("POST", "http://127.0.0.1:8000/o/token/", false);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(request_str);
    var response = JSON.parse(xhttp.responseText);
    console.log(response);
  }
  render() {

    return(
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
)
  }

}

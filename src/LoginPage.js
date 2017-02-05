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

  componentDidMount() {
    document.getElementById("formHorizontalPassword")
      .addEventListener("keyup", function(event) {
          event.preventDefault();
          if (event.keyCode === 13) {
              document.getElementById("submitButton").click();
          }
      });
  }

  handleClick() {
    // Makes sure it's not alerting
    this.setState({_alert_both: false});

    // Create the http request to do REST calls
    var xhttp = new XMLHttpRequest();
    const clientID = '2yCZ6QlDjFuS7ZTOwOaWCHPX7PU7s2iwWANqRFSy';

    // Validate username/password - trigger alert if invalid
    if (this.state._username.length < 1 || this.state._password.length < 1){
      this.setState({_alert_both: true});
      return null;
    }

    // REST call parameters
    var request_str = "grant_type=password&username="+this.state._username+"&password="+this.state._password+"&client_id="+clientID;
    xhttp.open("POST", "https://asap-test.colab.duke.edu/api/o/token/", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(request_str);
    xhttp.onreadystatechange = function () {
      if (xhttp.readyState === 4){
        var response = JSON.parse(xhttp.responseText);

        // 401 = unauthorized; 500 = internal server error
        if (xhttp.status === 401 || xhttp.status === 500){
          console.log('Unauthorized!!!!!');
          this.setState({_alert_both: true});
        }
        // Login successful
        else{
          // put access token in local storage and check whether it's user or admin
          localStorage.token = response['access_token'];
          console.log(localStorage.token);
          xhttp.open("GET", "https://asap-test.colab.duke.edu/api/user/current/", true);

          xhttp.onreadystatechange = function() {
              if (xhttp.readyState === 4) {
                var userResponse = JSON.parse(xhttp.responseText);
                console.log(userResponse);
                localStorage.username = userResponse.username;
                localStorage.isAdmin = userResponse.is_staff;
                (localStorage.isAdmin == "true") ? hashHistory.push('/adminpage') : hashHistory.push('/userpage');
              }
            }
          xhttp.setRequestHeader("Content-Type", "application/json");
          xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
          xhttp.send();
        }
      }
    }
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
        <Button id="submitButton" type="button" onClick={this.handleClick}>
          Sign in
        </Button>
      </Col>
    </FormGroup>
  </Form>
  </div>
)
  }

}

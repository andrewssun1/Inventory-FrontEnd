import React from "react";
import {hashHistory} from "react-router";
import { checkAuthAndAdmin } from "../Utilities";
var Bootstrap = require('react-bootstrap');
var Button = Bootstrap.Button;

var xhttp = new XMLHttpRequest();

class RequestButton extends React.Component {
    constructor(props){
        super(props);
        console.log("selected is " + this.props.selected)
        this.approveClick = this.approveClick.bind(this);
        this.approveRequest = this.approveRequest.bind(this);
        this.denyClick = this.denyClick.bind(this);
        this.denyRequest = this.denyRequest.bind(this);
        this.cancelClick = this.cancelClick.bind(this);
        this.cancelRequest = this.cancelRequest.bind(this);
    }
    componentWillMount() {
        if (checkAuthAndAdmin()) {
            console.log("checked auth and amin");
        }
    }
    denyRequest(requestID) {
        //TODO the admin_comment field will be changed to come from the modal
        var admin_comment = "this is a general admin comment to deny request";
        //var url = "https://asap-test.colab.duke.edu/api/request/deny/" + requestID + "/";
        var url = "http://localhost:8000/api/request/deny/" + requestID + "/";
        xhttp.open("PATCH", url, false); //synchronous request
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
        var requestBody = {"id": requestID, "admin_comment": admin_comment};
        //convert JSON to string to send for PATCH request
        xhttp.send(JSON.stringify(requestBody));
        if (xhttp.status === 401 || xhttp.status === 500){
            console.log("deny request did not work")
            var response = JSON.parse(xhttp.responseText);
            console.log("about to print response");
            console.log(response);
            if(!!localStorage.token){
                delete localStorage.token;
            }
            this.setState({
                _loginState: false
            });
            hashHistory.push('/login');
            return null;
        }
        else {
            var response = JSON.parse(xhttp.responseText);
            console.log("about to print response");
            console.log(response);
        }
    }

    cancelRequest(requestID) {
        //TODO the admin_comment field will be changed to come from the modal
        var cancellationReason = "this is a general comment to cancel request";
        //var url = "https://asap-test.colab.duke.edu/api/request/deny/" + requestID + "/";
        var url = "http://localhost:8000/api/request/cancel/" + requestID + "/";
        xhttp.open("PATCH", url, false); //synchronous request
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
        var requestBody = {"id": requestID, "reason": cancellationReason};
        //convert JSON to string to send for PATCH request
        xhttp.send(JSON.stringify(requestBody));
        if (xhttp.status === 401 || xhttp.status === 500){
            console.log("cancel request did not work")
            var response = JSON.parse(xhttp.responseText);
            console.log("about to print response");
            console.log(response);
            if(!!localStorage.token){
                delete localStorage.token;
            }
            this.setState({
                _loginState: false
            });
            hashHistory.push('/login');
            return null;
        }
        else {
            var response = JSON.parse(xhttp.responseText);
            console.log("about to print response");
            console.log(response);
        }
    }

    approveRequest(requestID) {
        //TODO the admin_comment field will come from the modal
        var admin_comment = "this is a general admin comment";
        var url = "https://asap-test.colab.duke.edu/api/request/approve/" + requestID + "/";
        xhttp.open("PATCH", url, false); //synchronous request
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
        var requestBody = {"id": requestID, "admin_comment": admin_comment};
        //convert JSON to string to send for PATCH request
        xhttp.send(JSON.stringify(requestBody));
        if (xhttp.status === 401 || xhttp.status === 500){
            if(!!localStorage.token){
                delete localStorage.token;
            }
            this.setState({
                _loginState: false
            });
            hashHistory.push('/login');
            return null;
        }
        else {
            var response = JSON.parse(xhttp.responseText);
            console.log("about to print response");
            console.log(response);
        }
    }
    approveClick() {
        var requestIDs = this.props.selected;
        var i;
        for (i = 0; i < requestIDs.length; i++) {
            console.log(requestIDs[i])
            this.approveRequest(requestIDs[i]);
        }
    }
    denyClick() {
        var requestIDs = this.props.selected;
        var i;
        for (i = 0; i < requestIDs.length; i++) {
            console.log(requestIDs[i])
            this.denyRequest(requestIDs[i]);
        }
    }
    cancelClick() {
        var requestIDs = this.props.selected;
        var i;
        for (i = 0; i < requestIDs.length; i++) {
            console.log(requestIDs[i])
            this.cancelRequest(requestIDs[i]);
        }
    }
    render() {
        const isAdmin = (localStorage.isAdmin === "true");
        return(
            isAdmin ?
            <div>
                <Bootstrap.ButtonToolbar>
                    <Button onClick={this.approveClick} bsStyle="success">Approve</Button>
                    <Button onClick={this.denyClick} bsStyle="danger">Deny</Button>
                </Bootstrap.ButtonToolbar>
            </div> :
            <div>
                <Bootstrap.ButtonToolbar>
                    <Button onClick={this.cancelClick} bsStyle="danger">Cancel</Button>
                    <Button onClick={this.denyClick} bsStyle="info">New Request</Button>
                </Bootstrap.ButtonToolbar>
            </div>

        )
    }
}

export default RequestButton;
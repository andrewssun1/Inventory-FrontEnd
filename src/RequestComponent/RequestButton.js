import React from "react";
import {hashHistory} from "react-router";

var xhttp = new XMLHttpRequest();

class RequestButton extends React.Component {
    constructor(props){
        super(props);
        console.log("selected is " + this.props.selected)
        this.approveClick = this.approveClick.bind(this);
        this.approveRequest = this.approveRequest.bind(this);
        this.denyClick = this.denyClick.bind(this);
        this.denyRequest = this.denyRequest.bind(this);
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
            window.location.reload();
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
    render() {

        return(
            <div>
                <button onClick={this.approveClick}>Approve</button>
                <button onClick={this.denyClick}>Deny</button>
            </div>
        )
    }
}

export default RequestButton;
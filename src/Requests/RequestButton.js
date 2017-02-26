import React from "react";
import {hashHistory} from "react-router";
var Bootstrap = require('react-bootstrap');
var Button = Bootstrap.Button;
import {restRequest, checkAuthAndAdmin} from "../Utilities.js"

//var xhttp = new XMLHttpRequest();

class RequestButton extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            requestProblemString: ''
        };
        this.approveClick = this.approveClick.bind(this);
        this.denyClick = this.denyClick.bind(this);
        this.cancelClick = this.cancelClick.bind(this);
        this.patchRequest = this.patchRequest.bind(this);
    }
    componentWillMount() {
        checkAuthAndAdmin(()=>{})
    }

    patchRequest(requestID, type, patchRequestBodyKey, patchRequestBodyValue) {
        this.setState({
            requestProblemString: ''
        })
        var url = "/api/shoppingCart/" + type + "/" + requestID + "/";
        var requestBody = {"id": requestID};
        var dict = {deny: "denied", cancel: "cancelled", approve: "approved"};
        requestBody[patchRequestBodyKey] = patchRequestBodyValue;
        restRequest("PATCH", url, "application/json", JSON.stringify(requestBody),
                    (responseText)=>{
                      var response = JSON.parse(responseText);
                      console.log("about to print response!!");
                      console.log(response);
                      this.props.cb._alertchild.generateSuccess("Successfully " + dict[type] + " request.");
                      this.props.cb.resetTable();
                    },
                    (status, responseText)=>{
                      var response = JSON.parse(responseText);
                      this.props.cb._alertchild.generateError(response.detail);
                      this.props.cb.resetTable();
                    });
    }

    approveClick() {
        var requestIDs = this.props.selected;
        for (let i = 0; i < requestIDs.length; i++) {
            console.log(requestIDs[i])
            this.patchRequest(requestIDs[i], "approve", "admin_comment", "");
            //this.approveRequest(requestIDs[i]);
        }
    }
    denyClick() {
        var requestIDs = this.props.selected;
        for (let i = 0; i < requestIDs.length; i++) {
            console.log(requestIDs[i])
            this.patchRequest(requestIDs[i], "deny", "admin_comment", "");
            //this.denyRequest(requestIDs[i]);
        }
    }
    cancelClick() {
        var requestIDs = this.props.selected;
        for (let i = 0; i < requestIDs.length; i++) {
            console.log(requestIDs[i])
            this.patchRequest(requestIDs[i], "cancel", "reason", "");
            //this.cancelRequest(requestIDs[i]);
        }
    }
    render() {
        const isSuperUser = (localStorage.isSuperUser === "true");
        return(
            <div style={{marginLeft: "11px"}}>
                {isSuperUser ?
                <div>
                    <Bootstrap.ButtonToolbar>
                        <Button onClick={this.approveClick} bsSize="sm" bsStyle="success">Approve</Button>
                        <Button onClick={this.denyClick} bsSize="sm" bsStyle="danger">Deny</Button>
                    </Bootstrap.ButtonToolbar>
                </div> :
                <div>
                    <Bootstrap.ButtonToolbar>
                        <Button onClick={this.cancelClick} bsSize="sm" bsStyle="danger">Cancel</Button>
                    </Bootstrap.ButtonToolbar>
                </div>}
            </div>


        )
    }
}

export default RequestButton;

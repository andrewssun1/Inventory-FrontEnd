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
        var url = "/api/request/" + type + "/" + requestID + "/";
        var requestBody = {"id": requestID};
        requestBody[patchRequestBodyKey] = patchRequestBodyValue;
        restRequest("PATCH", url, "application/json", JSON.stringify(requestBody),
                    (responseText)=>{
                      var response = JSON.parse(responseText);
                      console.log("about to print response!!");
                      console.log(response);
                      this.props.cb.resetTable();
                    },
                    (status, responseText)=>{
                      if (status === 401 || status === 500){
                          //<Alert message="alert message"></Alert>
                          console.log("patch request did not work")
                          var response = JSON.parse(responseText);
                          console.log("about to print response!");
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
                      else if(status === 405){
                          var response = JSON.parse(responseText);
                          console.log(response.detail);
                          this.setState({
                              requestProblemString: response.detail
                          })
                      }
                      this.props.cb.resetTable();
                    });
        // xhttp.open("PATCH", url, false); //synchronous request
        // xhttp.setRequestHeader("Content-Type", "application/json");
        // xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);


        // xhttp.send(JSON.stringify(requestBody));
        // if (xhttp.status === 401 || xhttp.status === 500){
        //     //<Alert message="alert message"></Alert>
        //     console.log("patch request did not work")
        //     var response = JSON.parse(xhttp.responseText);
        //     console.log("about to print response!");
        //     console.log(response);
        //     if(!!localStorage.token){
        //         delete localStorage.token;
        //     }
        //     this.setState({
        //         _loginState: false
        //     });
        //     hashHistory.push('/login');
        //     return null;
        // }
        // else if(xhttp.status === 405){
        //     response = JSON.parse(xhttp.responseText);
        //     console.log(response.detail);
        //     this.setState({
        //         requestProblemString: response.detail
        //     })
        // }
        // else {
        //     response = JSON.parse(xhttp.responseText);
        //     console.log("about to print response!!");
        //     console.log(response);
        // }
        // this.props.cb.resetTable();
    }

    approveClick() {
        var requestIDs = this.props.selected;
        for (let i = 0; i < requestIDs.length; i++) {
            console.log(requestIDs[i])
            this.patchRequest(requestIDs[i], "approve", "admin_comment", "this is a general admin comment");
            //this.approveRequest(requestIDs[i]);
        }
    }
    denyClick() {
        var requestIDs = this.props.selected;
        for (let i = 0; i < requestIDs.length; i++) {
            console.log(requestIDs[i])
            this.patchRequest(requestIDs[i], "deny", "admin_comment", "this is a general admin comment");
            //this.denyRequest(requestIDs[i]);
        }
    }
    cancelClick() {
        var requestIDs = this.props.selected;
        for (let i = 0; i < requestIDs.length; i++) {
            console.log(requestIDs[i])
            this.patchRequest(requestIDs[i], "cancel", "reason", "this is a cancellation reason");
            //this.cancelRequest(requestIDs[i]);
        }
    }
    render() {
        const isAdmin = (localStorage.isAdmin === "true");
        return(
            <div>
                <p style={{color:"red"}}> {this.state.requestProblemString} </p>
                {isAdmin ?
                <div>
                    <Bootstrap.ButtonToolbar>
                        <Button onClick={this.approveClick} bsStyle="success">Approve</Button>
                        <Button onClick={this.denyClick} bsStyle="danger">Deny</Button>
                    </Bootstrap.ButtonToolbar>
                </div> :
                <div>
                    <Bootstrap.ButtonToolbar>
                        <Button onClick={this.cancelClick} bsStyle="danger">Cancel</Button>
                    </Bootstrap.ButtonToolbar>
                </div>}
            </div>


        )
    }
}

export default RequestButton;

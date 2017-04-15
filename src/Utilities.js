// Utilities.js
// Utility functions
// @author Andrew

import { hashHistory } from 'react-router';
import { getServer } from "./SecretStuff.js"

const BACKEND_SERVER = getServer();

export function isLoggedIn(){
    return !!localStorage.token
}

// cb = function when auth is successful
// errorCb = function when auth is unsuccessful
export function checkAuthAndAdmin(cb, errorCb){
  restRequest("GET", "/api/user/current/", "application/json", null,
              (responseText) => {
                var userResponse = JSON.parse(responseText);
                localStorage.username = userResponse.username;
                localStorage.isStaff = userResponse.is_staff;
                localStorage.isSuperUser = userResponse.is_superuser;
                cb();
              },
              () =>{
                if(!!localStorage.token){
                  delete localStorage.token;
                }
                hashHistory.push('/login');
                if (errorCb !== undefined){
                  errorCb();
                }
              });
}

function restCb(xhttp, successCb, errorCb){
  if (xhttp.readyState === 4){
    return (xhttp.status === 200 ||
            xhttp.status === 201 ||
            xhttp.status === 204) ?
            successCb(xhttp.responseText) :
            errorCb(xhttp.status, xhttp.responseText);
  }
}

// requestType = GET, POST, etc.
// contentType = application/json, etc.
// requestStr = stringified JSON or null
// url = /api/...
// successCb returns responseText (needs to be parsed)
// errorCb return xhttpStatus and responseText
export function restRequest( requestType, url, contentType, requestStr, successCb, errorCb ) {
  var xhttp = new XMLHttpRequest();
  xhttp.open(requestType, BACKEND_SERVER + url, true);
  xhttp.setRequestHeader("Content-Type", contentType);
  if (localStorage.token){
    xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
  }
  var f = function(){restCb(xhttp, successCb, errorCb)};
  xhttp.onreadystatechange = f;
  xhttp.send(requestStr);
}

export function restRequestData( requestType, url, requestData, successCb, errorCb ) {
  var xhttp = new XMLHttpRequest();
  xhttp.open(requestType, BACKEND_SERVER + url, true);
  if (localStorage.token){
    xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
  }
  var f = function(){restCb(xhttp, successCb, errorCb)};
  xhttp.onreadystatechange = f;
  xhttp.send(requestData);
}

export function handleErrors(errResponse, alertchild) {
  let errs = JSON.parse(errResponse);
  var errorString = "";
  for (var key in errs) {
    if (errs.hasOwnProperty(key)) {
      let errorArray = errs[key];
      for(var i = 0; i < errorArray.length; i ++) {
        let errorObject = errorArray[i];
        errorString = errorString + errorObject;
      }
    }
  }
  if(errorString != "") {
    alertchild.generateError(errorString);
  }
}

export function handleServerError(alertchild) {
  alertchild.generateError("An internal server error has occurred. Please contact the system administrator.");
}

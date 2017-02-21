// Utilities.js
// Utility functions
// @author Andrew

import { hashHistory } from 'react-router';

const BACKEND_SERVER = "https://asap-test.colab.duke.edu"

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
                localStorage.isAdmin = userResponse.is_staff;
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

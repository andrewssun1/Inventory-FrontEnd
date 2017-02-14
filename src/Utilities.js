// Utilities.js
// Utility functions
// @author Andrew

import { hashHistory } from 'react-router';

//var xhttp;
// var success;
// var error;

export function isLoggedIn(){
    return !!localStorage.token
}

export function checkAuthAndAdmin(){
  // Creates request for user
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", "https://asap-test.colab.duke.edu/api/user/current/", false);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
  xhttp.send();

  // Checks auth
    if (xhttp.status === 401 || xhttp.status === 500){
      if(!!localStorage.token){
        delete localStorage.token;
      }
      hashHistory.push('/login');
      return false;
    }

    // Checks admin
    else{
      var userResponse = JSON.parse(xhttp.responseText);
      localStorage.username = userResponse.username;
      localStorage.isAdmin = userResponse.is_staff;
      return true;
    }
}

function restCb(xhttp, successCb, errorCb){
  console.log(xhttp.readyState)
  if (xhttp.readyState === 4){
    console.log("BLAHHHHGHH");
    (xhttp.status === 401 || xhttp.status === 500) ? errorCb() : successCb(xhttp.responseText)
  }
}

export function restRequest( requestType, contentType, requestStr, url, successCb, errorCb ) {
  var xhttp = new XMLHttpRequest();
  // success = successCb;
  // error = errorCb;
  xhttp.open(requestType, url, true);
  xhttp.setRequestHeader("Content-Type", contentType);
  xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
  var f = function(){restCb(xhttp, successCb, errorCb)};
  // console.log(xhttp.readState)
  xhttp.onreadystatechange = f;
  xhttp.send(requestStr);
  console.log("ARGHHHHHHHH!!");
}

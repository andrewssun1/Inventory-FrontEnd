// Utilities.js
// Utility functions
// @author Andrew

import { hashHistory } from 'react-router';

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

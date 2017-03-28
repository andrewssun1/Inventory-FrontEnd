import React from "react";

import APIKeyComponent from './APIKeyComponent.js';
import EmailComponent from './EmailComponent.js';

export default class SettingsComponent extends React.Component {

  constructor(props){
    super(props);
  }

  render(){
    return(
      <div>
      <h2> API Key </h2>
      <APIKeyComponent />
      {localStorage.isStaff === "true" ?
      <div>
      <hr />
      <h2> Email </h2>
      <EmailComponent />
      </div>
      : null}
      </div>
    );
  }

}

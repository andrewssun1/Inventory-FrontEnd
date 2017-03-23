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
      <APIKeyComponent />
      {localStorage.isStaff === "true" ?
      <div>
      <hr />
      <EmailComponent />
      </div>
      : null}
      </div>
    );
  }

}

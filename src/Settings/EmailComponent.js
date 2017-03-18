import React from "react";
import {checkAuthAndAdmin, restRequest} from "../Utilities.js";
import {Button, Label, FormGroup, FormControl} from 'react-bootstrap';

export default class EmailComponent extends React.Component {

  constructor(props){
    super(props);
  }


  render(){
    return(
      <div>
      <h2> Email </h2>
      </div>
    );
  }

}

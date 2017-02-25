var React = require('react');
import {Alert } from 'react-bootstrap';

export default class AlertComponent extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      showAlert: false,
      alertType: "danger",
      alertMessage: ""
    }
  }

  closeAlert(){
    this.setState({showAlert: false});
  }

  generateSuccess(msg){
    this.setState({showAlert:true, alertType:"success", alertMessage: msg});
  }

  generateError(msg){
    this.setState({showAlert:true, alertType:"danger", alertMessage: msg});
  }

  generateAlert(){
    return (
      <Alert bsStyle={this.state.alertType} onDismiss={()=>{
        this.setState({showAlert: false});
      }}>
      <strong>{this.state.alertMessage}</strong>
      </Alert>)
  }

render(){
  return(
    <div>
    {(this.state.showAlert === true) ? this.generateAlert() : null}
    </div>);
}

}

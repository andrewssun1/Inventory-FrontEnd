// MasterPage.js
// Holds elements consistent throughout all components
// @author Andrew

var React = require('react');
//import isLoggedIn from './Utilities.js'
import { hashHistory } from 'react-router';

export default class MasterPage extends React.Component {

  constructor(props){
    super(props);
    this.handleLoginButton = this.handleLoginButton.bind(this);
  }

  componentWillMount() {
    !!localStorage.token ? (localStorage.isAdmin ? hashHistory.push('adminpage') : hashHistory.push('/userpage')) : hashHistory.push('/login');
    }

  handleLoginButton(e){
    if(!!localStorage.token){
      delete localStorage.token;
    }
    hashHistory.push('/login');
  }

  render(){
    const hStyle = {
      textAlign:'center',
      marginBottom: '2cm'
    };
    const loginStyle = {
      marginRight: '1cm'
    };
    return(
      <div>
        <button type="button" className="btn btn-primary btn-lg pull-right" style={loginStyle} onClick={this.handleLoginButton}>{!!localStorage.token ? "Logout" : "Login"}</button>
        <h1 style={hStyle}>Welcome to Duke University Inventory System</h1>
        {this.props.children}
      </div>
    )
  }
}

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
    //!!localStorage.token ? ((localStorage.isSuperUser == "true") ? hashHistory.push('adminpage') : hashHistory.push('/userpage')) : hashHistory.push('/login');
    !!localStorage.token ? hashHistory.push('/main') : hashHistory.push('/login');
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
    //        <Button className="pull-right" style={{marginRight: '2cm'}} bsSize="large"><Glyphicon glyph="shopping-cart" />  Cart</Button>
    return(
      <div>
        {!!localStorage.token ? <button type="button" className="btn btn-primary btn-lg pull-right" style={loginStyle} onClick={this.handleLoginButton}>Logout</button> : null}
        <h1 style={hStyle}>Welcome to Duke ECE Inventory System</h1>
        {this.props.children}
      </div>
    )
  }
}

// ManageUsers.js
// Makes admins be able to view, add, edit, delete users
// @author Andrew

var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var Bootstrap = require('react-bootstrap');
var moment = require('moment');

var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
import {checkAuthAndAdmin} from './Utilities'
var xhttp = new XMLHttpRequest();

export default class ManageUsers extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      _users: []
    }
    this.onAddRow = this.onAddRow.bind(this);
    this.onDeleteRow = this.onDeleteRow.bind(this);
  }

  componentWillMount() {
    if (checkAuthAndAdmin()){
        // GET request to get all items from database
        xhttp.open("GET", "https://asap-production.colab.duke.edu/api/user/", false);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
        if (xhttp.status === 401 || xhttp.status === 500){
          console.log('GET Failed!!');
        }
        xhttp.send();
        var response = JSON.parse(xhttp.responseText);
        var response_results = response.results;
        for (var i = 0; i < response_results.length; i++){
          response.results[i].last_login = moment(response.results[i].last_login).format('lll')
          response.results[i].date_joined = moment(response.results[i].date_joined).format('lll')
        }
        this.setState({
            _users: response_results
        });
    }
    // auth failed
    else{
        this.setState({
            _loginState: false
        });
    }
  }

  // Makes sure name has at least one character
  nameValidator(value) {
    if (!value || value === ""){
      return "Name must be at least one character!"
    }
    return true;
  }

  onAddRow(row) {
    if (checkAuthAndAdmin() && row){ // should we check for auth/admin here? yes right?
      xhttp.open("POST", "https://asap-production.colab.duke.edu/api/user/", false);
      xhttp.setRequestHeader("Content-Type", "application/json");
      xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
      if (xhttp.status === 401 || xhttp.status === 500){
        console.log('POST Failed!!');
      }
      // POST request able to continue
        else{
          var sendJSON = {};
          sendJSON.username = row.username;
          sendJSON.password = row.password;
          sendJSON.email = row.email;
          sendJSON.is_staff = (row.is_staff == 'true');

          this.state._users.push(row);
          var jsonResult = JSON.stringify(sendJSON);

          // Send the row and parse the response
          xhttp.send(jsonResult);
          var response = JSON.parse(xhttp.responseText);
          row.id = response.id;
      }
    }
  }

  onDeleteRow(rows) {
    if(checkAuthAndAdmin() && rows){
        xhttp.open("DELETE", "https://asap-production.colab.duke.edu/api/user/"+rows[0], false);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
        xhttp.send();
      this.setState({
        _users: this.state._users.filter((product) => {
          return rows.indexOf(product.id) === -1;
        })
      })
    }
    // console.log(rows);
  }


  render(){
    const isAdmin = (localStorage.isAdmin == "true");

    const selectRow = {
      mode: 'checkbox' //radio or checkbox
    };

    const options = {
      onAddRow: this.onAddRow,
      onDeleteRow: this.onDeleteRow,
      // onRowClick: this.onRowClick,
    };

    const jobTypes = [ "true", "false" ];

    return(
      <div>
      <BootstrapTable ref="managetable" options={options} insertRow={true} selectRow={selectRow} data={this.state._users} deleteRow={true} striped hover>
      <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden autoValue={true}>id</TableHeaderColumn>
      <TableHeaderColumn dataField='username' editable={ { validator: this.nameValidator} }>Username</TableHeaderColumn>
      <TableHeaderColumn dataField='password' editable={ { validator: this.nameValidator} } hidden>Password</TableHeaderColumn>
      <TableHeaderColumn dataField='email'>Email</TableHeaderColumn>
      <TableHeaderColumn dataField='is_staff' editable={ { type: 'select', options: { values: jobTypes } } }>Is Admin</TableHeaderColumn>
      <TableHeaderColumn dataField='last_login' hiddenOnInsert>Last Logged In</TableHeaderColumn>
      <TableHeaderColumn dataField='date_joined' hiddenOnInsert>Date Joined</TableHeaderColumn>
      </BootstrapTable>
      </div>
    )
  }
}

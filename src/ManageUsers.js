// ManageUsers.js
// Makes admins be able to view, add, edit, delete users
// @author Andrew

var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var moment = require('moment');

var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
import {restRequest, checkAuthAndAdmin} from './Utilities'
var xhttp = new XMLHttpRequest();

export default class ManageUsers extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      _users: []
    }
    this.onAddRow = this.onAddRow.bind(this);
    this.onDeleteRow = this.onDeleteRow.bind(this);
    this.nameValidator = this.nameValidator.bind(this);
  }

  componentWillMount() {
    checkAuthAndAdmin(()=>{
        // GET request to get all items from database
        restRequest("GET", "/api/user/", "application/json", null,
                    (responseText)=>{
                      var response = JSON.parse(responseText);
                      var response_results = response.results;
                      for (var i = 0; i < response_results.length; i++){
                        response.results[i].last_login = moment(response.results[i].last_login).format('lll')
                        response.results[i].date_joined = moment(response.results[i].date_joined).format('lll')
                      }
                      this.setState({
                          _users: response_results
                      });
                    },
                    ()=>{
                      console.log('GET Failed!!');
                      this.setState({
                          _loginState: false
                      });
                    });
    }, ()=>{
      // auth failed
          this.setState({
              _loginState: false
          });
    });
  }

  componentDidMount(){
    this.refs.managetable.refs.toolbar.refs.form[1].type = "password";
  }

  // Makes sure name has at least one character
  nameValidator(value) {
    if (!value || value === ""){
      return "Name must be at least one character!"
    }
    return true;
  }

  onAddRow(row) {
    checkAuthAndAdmin(()=>{
      var sendJSON = {};
      sendJSON.username = row.username;
      sendJSON.password = row.password;
      sendJSON.email = row.email;
      sendJSON.is_staff = (row.is_staff === 'true');
      var jsonResult = JSON.stringify(sendJSON);
      restRequest("POST", "/api/user/", "application/json", jsonResult,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    row.id = response.id;
                    this.state._users.push(row);
                  }, ()=>{console.log('POST Failed!!');});
    });
  }

  onDeleteRow(rows) {

    checkAuthAndAdmin(()=>{
      restRequest("DELETE", "/api/user/"+rows[0], "application/json", null,
                  ()=>{
                    this.setState({
                      _users: this.state._users.filter((product) => {
                        return rows.indexOf(product.id) === -1;
                      })
                    })
                  },
                  ()=>{}
                );
    });
  }


  render(){

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

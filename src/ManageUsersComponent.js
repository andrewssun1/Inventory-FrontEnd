// ManageUsers.js
// Makes admins be able to view, add, edit, delete users
// @author Andrew

var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var moment = require('moment');

var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
import {restRequest, checkAuthAndAdmin} from './Utilities'
import AlertComponent from './AlertComponent';

export default class ManageUsersComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      _users: [{is_superuser: false}]
    }
    this.onAddRow = this.onAddRow.bind(this);
    this.onDeleteRow = this.onDeleteRow.bind(this);
    this.nameValidator = this.nameValidator.bind(this);
    this.afterSaveCell = this.afterSaveCell.bind(this);
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
      return "Field cannot be blank."
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
      sendJSON.is_superuser = (row.is_superuser === 'true');
      var jsonResult = JSON.stringify(sendJSON);
      restRequest("POST", "/api/user/", "application/json", jsonResult,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    console.log(response);
                    row.id = response.id;
                    this.state._users.push(row);
                    this._alertchild.generateSuccess("Successfully added " + sendJSON.username);
                  }, (status, errResponse)=>{
                    var errs = JSON.parse(errResponse);
                    for (var key in errs){
                      console.log(key);
                      this._alertchild.generateError("Error: " + ((key === "email") ? errs[key][0] : errs[key]));
                    }
                    console.log(JSON.parse(errResponse));
                    this.forceUpdate();
                  });
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
                    });
                    this._alertchild.generateSuccess("Successfully deleted user.");
                  },
                  ()=>{}
                );
    });
  }

  emailValidator(value){
    var re = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    if (!re.test(value)){
      return "Please enter a valid email."
    }
    return true;
  }

  afterSaveCell(row, cellName, cellValue) {
    console.log("After Save Cell");
    console.log(row);
    checkAuthAndAdmin(()=>{
      var requestBody = {
        "email": row.email,
        "is_staff": (row.is_staff === "true" || row.is_staff),
        "is_superuser": (row.is_superuser === "true" || row.is_superuser)
      }
      var jsonResult = JSON.stringify(requestBody);
      restRequest("PATCH", "/api/user/" + row.id, "application/json", jsonResult,
      (responseText)=>{
        var response = JSON.parse(responseText);
        console.log("Getting Response");
        console.log(response);
      },
      ()=>{
        console.log('PATCH Failed!!');
      });
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

    const cellEdit = {
      mode: 'click', // click cell to edit
      afterSaveCell: this.afterSaveCell,
      blurToSave: true
    };

    const jobTypes = [ "true", "false" ];

    return(
      <div>
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      <BootstrapTable ref="managetable" options={options} insertRow={true} selectRow={selectRow} data={this.state._users} deleteRow={true} cellEdit={cellEdit} striped hover>
      <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden autoValue={true}>id</TableHeaderColumn>
      <TableHeaderColumn dataField='username' editable={ { validator: this.nameValidator} }>Username</TableHeaderColumn>
      <TableHeaderColumn dataField='password' editable={ { validator: this.nameValidator} } hidden>Password</TableHeaderColumn>
      <TableHeaderColumn dataField='email' editable={ { validator: this.emailValidator} }>Email</TableHeaderColumn>
      <TableHeaderColumn dataField='is_staff'  editable={ { type: 'select', options: { values: jobTypes } } } >Is Manager</TableHeaderColumn>
      <TableHeaderColumn dataField='is_superuser' editable={ { type: 'select', options: { values: jobTypes} } }>Is Admin</TableHeaderColumn>
      <TableHeaderColumn dataField='date_joined' editable={false} hiddenOnInsert>Date Joined</TableHeaderColumn>
      </BootstrapTable>
      </div>
    )
  }
}

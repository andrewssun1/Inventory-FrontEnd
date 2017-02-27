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


const PermissionsEnum = {
    UNPRIVILEGED: "Unprivileged",
    MANAGER: "Manager",
    ADMIN: "Admin"
};

export default class ManageUsersComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      _users: [{is_superuser: false}]
    }
    this.onAddRow = this.onAddRow.bind(this);
    this.onDeleteRow = this.onDeleteRow.bind(this);
    // this.nameValidator = this.nameValidator.bind(this);
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
                        response_results[i].last_login = moment(response_results[i].last_login).format('lll')
                        response_results[i].date_joined = moment(response_results[i].date_joined).format('lll')
                        if (response_results[i].is_superuser) {
                          response_results[i]["permission_level"] = PermissionsEnum.ADMIN;
                        } else if (response_results[i].is_staff) {
                          response_results[i]["permission_level"] = PermissionsEnum.MANAGER;
                        } else {
                          response_results[i]["permission_level"] = PermissionsEnum.UNPRIVILEGED;
                        }
                      }
                      this.setState({
                          _users: response_results
                      });
                    },
                    (status, errResponse)=>{
                      this._alertchild.generateError("Error retrieving user data. Please contact the system administrator." + " (Error Code: " + status + ")");
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

  onAddRow(row) {
    checkAuthAndAdmin(()=>{
      var sendJSON = {};
      sendJSON.username = row.username;
      sendJSON.password = row.password;
      sendJSON.email = row.email;
      sendJSON.is_staff = (row.permission_level === PermissionsEnum.MANAGER || row.permission_level === PermissionsEnum.ADMIN);
      sendJSON.is_superuser = (row.permission_level === PermissionsEnum.ADMIN);
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
                      if (errs.hasOwnProperty(key)){
                        console.log(key);
                        this._alertchild.generateError("Error: " + ((key === "email") ? errs[key][0] : errs[key]));
                      }
                    }
                    if(this._alertchild.state.alertMessage === "Error: This field may not be blank.") {
                      this._alertchild.generateError("Error: Please fill out all fields when adding a user");
                    }
                    let response = JSON.parse(errResponse);
                    console.log(response);
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
                  (status, errResponse)=>{
                    this._alertchild.generateError("There was an error deleting the users. Please contact the system administrator." + " (Error Code: " + status + ")");
                  }
                );
    });
  }

  afterSaveCell(row, cellName, cellValue) {
    checkAuthAndAdmin(()=>{
      var requestBody = {
        "email": row.email,
        "is_staff": (row.permission_level === PermissionsEnum.MANAGER || row.permission_level === PermissionsEnum.ADMIN),
        "is_superuser": (row.permission_level === PermissionsEnum.ADMIN)
      }
      var jsonResult = JSON.stringify(requestBody);
      restRequest("PATCH", "/api/user/" + row.id, "application/json", jsonResult,
      (responseText)=>{
        var response = JSON.parse(responseText);
        console.log("Getting Response");
        console.log(response);
        this._alertchild.generateSuccess("Successfully changed user permission level");
      },
      (status, errResponse)=>{
        this._alertchild.generateError("There was an error changing user permission level. Please contact the system administrator." + " (Error Code: " + status + ")");
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
      ignoreEditable: true
    };

    const cellEdit = {
      mode: 'click', // click cell to edit
      afterSaveCell: this.afterSaveCell,
      blurToSave: true
    };

    const permissionTypes = [PermissionsEnum.UNPRIVILEGED, PermissionsEnum.MANAGER, PermissionsEnum.ADMIN];

    return(
      <div>
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      <BootstrapTable ref="managetable" options={options} insertRow={true} selectRow={selectRow} data={this.state._users} deleteRow={true} cellEdit={cellEdit} striped hover>
      <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden autoValue={true}>id</TableHeaderColumn>
      <TableHeaderColumn dataField='username' editable={false}>Username</TableHeaderColumn>
      <TableHeaderColumn dataField='password' editable={false} hidden>Password</TableHeaderColumn>
      <TableHeaderColumn dataField='email' editable={false}>Email</TableHeaderColumn>
      <TableHeaderColumn dataField='permission_level' editable={ { type: 'select', options: { values: permissionTypes } } }> Permission Level</TableHeaderColumn>
      <TableHeaderColumn dataField='date_joined' editable={false} hiddenOnInsert>Date Joined</TableHeaderColumn>
      </BootstrapTable>
      </div>
    )
  }
}

// Allows users to view, add, and delete custom tags
// @author Patrick Terry

var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var Bootstrap = require('react-bootstrap');

var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;

// import { hashHistory } from 'react-router';
import { checkAuthAndAdmin } from '../Utilities';

var xhttp = new XMLHttpRequest();

class CustomFieldTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      _fields: []
    };
    this.getFieldData = this.getFieldData.bind(this);
    this.onAddRow = this.onAddRow.bind(this);
    this.onDeleteRow = this.onDeleteRow.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
  }

  componentWillMount() {
    this.getFieldData();
  }

  getFieldData() {
    xhttp.open("GET","https://asap-test.colab.duke.edu/api/item/field/", false);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
    xhttp.send();
    var response = JSON.parse(xhttp.responseText);
    var response_results = response.results
    console.log(response);
    this.setState({_fields: response_results});
  }

  onAddRow(row) {
    xhttp.open("POST","https://asap-test.colab.duke.edu/api/item/field/", false);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
    var requestBody = {
      "name"    : row.name,
      "type"    : row.type,
      "private" : row.private
    }
    console.log(requestBody);
    var jsonResult = JSON.stringify(requestBody);
    xhttp.send(jsonResult);
    var response = JSON.parse(xhttp.responseText);
    var response_results = response.results
    console.log(response);
    this.getFieldData();
  }

  onDeleteRow(rows) {
    console.log(rows);
    for (var i = 0; i < rows.length; i++){
      xhttp.open("DELETE","https://asap-test.colab.duke.edu/api/item/field/" + rows[i], false);
      xhttp.setRequestHeader("Content-Type", "application/json");
      xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
      xhttp.send();
    }
    this.getFieldData();
  }

  onRowClick(row, isSelected, e) {
    //TODO: anything here?
  }

  render() {
    const selectRow = {
      mode: 'checkbox' //radio or checkbox
    };

    const options = {
      onAddRow: this.onAddRow,
      onDeleteRow: this.onDeleteRow,
      onRowClick: this.onRowClick,
    };

    return(
      <div>
      <BootstrapTable ref="customFieldTable" remote={ true } options={options}
      selectRow={selectRow} deleteRow={true} insertRow={true} data={this.state._fields} striped hover>
      <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden autoValue={true}>id</TableHeaderColumn>
      <TableHeaderColumn dataField='name'>Name</TableHeaderColumn>
      <TableHeaderColumn dataField='type'>Type</TableHeaderColumn>
      <TableHeaderColumn dataField='private'>Privacy</TableHeaderColumn>
      </BootstrapTable>
      </div>
    )
  }
}

export default CustomFieldTable;

// Allows users to view, add, and delete custom tags
// @author Patrick Terry

var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var Bootstrap = require('react-bootstrap');

var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;

import {restRequest, checkAuthAndAdmin} from "../Utilities.js"

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
  }

  componentWillMount() {
    this.getFieldData();
  }

  getFieldData() {
    checkAuthAndAdmin(()=>{
      restRequest("GET", "/api/item/field/", "application/json", null,
      (responseText)=>{
        var response = JSON.parse(responseText);
        console.log("Getting Custom Field Response");
        console.log(response);
        this.setState({_fields: response.results});
      },
      ()=>{console.log('GET Failed!!');}
    );
  });
}

onAddRow(row) {
  checkAuthAndAdmin(()=>{
    var requestBody = {
      "name"    : row.name,
      "type"    : row.type,
      "private" : row.private
    }
    var jsonResult = JSON.stringify(requestBody);
    restRequest("POST", "/api/item/field/", "application/json", jsonResult,
    (responseText)=>{
      var response = JSON.parse(responseText);
      console.log("Getting Add Custom Field Response");
      console.log(response);
      this.getFieldData();
    },
    ()=>{console.log('GET Failed!!');}
  );
});
}

onDeleteRow(rows) {
  for (var i = 0; i < rows.length; i++) {
    restRequest("DELETE", "/api/item/field/" + rows[i], "application/json", null,
    (responseText)=>{ this.getFieldData();},
    ()=>{console.log('GET Failed!!');}
  );
}
}

render() {
  const selectRow = {
    mode: 'checkbox' //radio or checkbox
  };

  const options = {
    onAddRow: this.onAddRow,
    onDeleteRow: this.onDeleteRow
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

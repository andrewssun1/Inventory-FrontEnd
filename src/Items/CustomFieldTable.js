// Allows users to view, add, and delete custom tags
// @author Patrick Terry

var React = require('react');
var ReactBsTable = require('react-bootstrap-table');

var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;

import TypeConstants from "../TypeConstants.js"
import CustomFieldDetail from "./CustomFieldDetail.js"

import {restRequest, checkAuthAndAdmin} from "../Utilities.js"

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
    checkAuthAndAdmin(()=>{
      restRequest("GET", "/api/item/field/", "application/json", null,
      (responseText)=>{
        var response = JSON.parse(responseText);
        console.log("Getting Custom Field Response");
        console.log(response);
        var results = response.results;
        for(var i = 0; i < results.length; i++) {
          results[i].type = TypeConstants.RequestToFormatMap[results[i].type];
          if(results[i].private) {
            results[i].private = "Private";
          } else {
            results[i].private = "Public";
          }
        }
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
      "type"    : TypeConstants.FormattedToRequestMap[row.type],
      "private" : (row.private === 'Private')
    }
    console.log(requestBody);
    var jsonResult = JSON.stringify(requestBody);
    restRequest("POST", "/api/item/field/", "application/json", jsonResult,
    (responseText)=>{
      var response = JSON.parse(responseText);
      console.log("Getting Add Custom Field Response");
      console.log(response);
      this.getFieldData();
    },
    ()=>{console.log('Add Failed!!');}
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

onRowClick(row) {
  console.log(row);
  this._detail.openModal(row);
}

render() {
  const selectRow = {
    mode: 'checkbox' //radio or checkbox
  };

  const options = {
    onAddRow: this.onAddRow,
    onDeleteRow: this.onDeleteRow,
    onRowClick: this.onRowClick
  };

  const typeList = TypeConstants.FormattedStrings;
  const boolList = [ "Public", "Private"];

  return(
    <div>
    <BootstrapTable ref="customFieldTable" remote={ true } options={options}
    selectRow={selectRow} deleteRow={true} insertRow={true} data={this.state._fields} striped hover>
    <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden autoValue={true}>id</TableHeaderColumn>
    <TableHeaderColumn dataField='name'>Name</TableHeaderColumn>
    <TableHeaderColumn dataField='type' editable={ { type: 'select', options: { values: typeList} } }>Type</TableHeaderColumn>
    <TableHeaderColumn dataField='private' editable={ { type: 'select', options: { values: boolList} } }>Privacy</TableHeaderColumn>
    </BootstrapTable>
    <CustomFieldDetail cb={this} ref={(child) => { this._detail = child; }} ></CustomFieldDetail>
    </div>
  )
}
}

export default CustomFieldTable;

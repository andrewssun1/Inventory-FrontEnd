// Displays assets, allows creating and deleting
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
var ReactBsTable = require('react-bootstrap-table');
import {restRequest} from "../Utilities";
import AssetDetail from './AssetDetail';
import TypeConstants from '../TypeConstants';
import Select from 'react-select';
import CartQuantityChooser from '../ShoppingCart/CartQuantityChooser';
import InstaButtons from './InstaButtons';
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn
var Button = Bootstrap.Button;

class AssetTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      assetData: null,
      fields: null,
      users: [],
      selectValues: [],
      userMap: []
    }
    this.requestAssets = this.requestAssets.bind(this);
    this.onAddRow = this.onAddRow.bind(this);
    this.onDeleteRow = this.onDeleteRow.bind(this);
    this.onAssetRowClick = this.onAssetRowClick.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.userSelectFormatter = this.userSelectFormatter.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.assetButtonFormatter = this.assetButtonFormatter.bind(this);
  }

  componentWillMount() {
    this.requestAssets();
    this.getFieldData();
    this.getUsers();
  }

  requestAssets() {
    console.log("requesting assets");
    restRequest("GET", "/api/item/asset?item__id=" + this.props.id + "&search", "application/json", null,
    (responseText)=>{
      var response = JSON.parse(responseText);
      console.log("Getting Asset Response");
      console.log(response);
      this.setState({assetData: response.results});
      //TODO: add Error/success messages
    },
    ()=>{console.log('GET Failed!!');});
  }

  getFieldData() {
    restRequest("GET", "/api/item/asset/field/", "application/json", null,
    (responseText)=>{
      var response = JSON.parse(responseText);
      console.log("Getting Custom Field Response iin ItemTable");
      console.log(response);
      var results = response.results;
      this.setState({_fields: response.results});
    },
    ()=>{console.log('GET Failed!!');}
  );
}

getUsers() {
  restRequest("GET", "/api/user/large/", "application/JSON", null,
  (responseText)=>{
    var response = JSON.parse(responseText);
    console.log(response);
    let usernameIDMap = [];
    for (var i = 0; i < response.results.length; i++){
      var username = response.results[i].username;
      this.state.users.push({label: username, value: username});
      usernameIDMap[username] = response.results[i].id;
    }
    this.setState({userMap: usernameIDMap});
  }, ()=>{});
}

userSelectFormatter(cell, row) {
  return(
    <div>
    <Select simpleValue
    placeholder="Select"
    value={this.state.selectValues[row.asset_tag]}
    options={this.state.users}
    onChange={(value)=>{this.handleSelectChange(value, row)}}/>
    </div>
  )
}

handleSelectChange(value, row) {
  let tempState = this.state.selectValues;
  tempState[row.asset_tag] = value;
  this.setState({selectValues: tempState});
}

assetButtonFormatter(cell, row) {
  console.log(row);
  if(row.disbursement != null) {
    return(<b> Disbursed to {row.disbursement.cart_owner}</b>);
  } else if(row.loan != null) {
    return(<b> Loaned to {row.loan.cart_owner}</b>);
  } else {
    //ID thing looks complicated, but it's just finding the username corresponding to
    //this asset using selectValues, then using that to find the appropriate user ID
    //using userMap
    return (
      <InstaButtons row={row} id={this.state.userMap[this.state.selectValues[row.asset_tag]]} updateCallback={this}/>
    );
  }
}

onAddRow(row) {
  console.log(row);
  var requestBody = {
    "item_id" : this.props.id
  }
  let jsonResult = JSON.stringify(requestBody);
  restRequest("POST", "/api/item/asset/", "application/json", jsonResult,
  (responseText)=>{
    var response = JSON.parse(responseText);
    console.log("Getting add asset response");
    console.log(response);
    row.id = response.id;
    this.addAssetFields(row);
    this.requestAssets();
  },
  ()=>{console.log('GET Failed!!');}
);
}

addAssetFields(row) {
  //Request to get Asset. This is a mess
  restRequest("GET", "/api/item/asset/" + row.id, "application/json", null,
  (responseText)=>{
    var detailedResponse = JSON.parse(responseText);
    //Now that we have the detail:
    //Custom Fields:
    var typesArray = TypeConstants.RequestStrings;
    var responseDataArrays = [detailedResponse.int_fields, detailedResponse.float_fields, detailedResponse.short_text_fields, detailedResponse.long_text_fields];
    for(var i = 0; i < typesArray.length; i++) {
      for(var j = 0; j < responseDataArrays[i].length; j++) {
        this.customFieldRequest(typesArray[i], responseDataArrays[i][j].id, row[responseDataArrays[i][j].field]);
      }
    }
  }, ()=>{console.log('GET Detailed Failed!!');});
}

customFieldRequest(type, id, value) {
  if(value == null) return;
  var requestBody = {
    "value": value
  }
  var jsonResult = JSON.stringify(requestBody);
  restRequest("PATCH", "/api/item/asset/field/" + type + "/" + id, "application/json", jsonResult,
  (responseText)=>{
    var response = JSON.parse(responseText);
    console.log("Getting Response");
    console.log(response);
  },
  ()=>{
    console.log('PATCH Failed!!');
  });
}

onDeleteRow(rows) {
  for(var i = 0; i < this.state.assetData.length; i ++) {
    for(var j = 0; j < rows.length; j ++) {
      if(this.state.assetData[i].asset_tag === rows[j]) {
        restRequest("DELETE", "/api/item/asset/"+this.state.assetData[i].id, "application/json", null,
        ()=>{
          this.requestAssets();
          this.props.updateCallback.getDetailedItem(this.props.id);
        }, (status, errResponse)=>{
          console.log('GET Failed!!');
        });
      }
    }
  }
}

onAssetRowClick(row, isSelected, e) {
  //TODO: Uncomment when you figure out how to copy Andrew's funky logic
  /*console.log("Asset Row Click");
  console.log(row);
  this._assetDetail.getDetailedAsset(row.id);
  this._assetDetail.openModal();*/
}


renderColumns() {
  //TODO: ask about asset_tag bug
  var cols = [];
  cols.push(<TableHeaderColumn key="asset_tag" dataField='asset_tag' hiddenOnInsert isKey>Asset Tag</TableHeaderColumn>);
  for(var i = 0; i < this.state._fields.length; i++) {
    let name = this.state._fields[i].name;
    cols.push(<TableHeaderColumn key={name + "Col"} dataField={name} hidden>{name}</TableHeaderColumn>);
  }
  cols.push(<TableHeaderColumn key="userCol" dataField='users' dataFormat={this.userSelectFormatter} dataAlign="center" hiddenOnInsert columnClassName='my-class'></TableHeaderColumn>);
  cols.push(<TableHeaderColumn key="buttonCol" dataField='button' dataFormat={this.assetButtonFormatter} dataAlign="center" hiddenOnInsert columnClassName='my-class'></TableHeaderColumn>);
  return cols;
}

render() {
  const selectRow = {
    mode: 'checkbox' //radio or checkbox
  };

  const options = {
    onAddRow: this.onAddRow,
    onDeleteRow: this.onDeleteRow,
    onRowClick: this.onAssetRowClick
  };

  if((localStorage.isStaff === "true") && this.state.assetData != null) {
    return(
      <div>
      <p> <b> Instances of this Asset: </b> </p>
      <AssetDetail ref={(child) => { this._assetDetail = child; }} />
      <BootstrapTable ref="assetTable"
      data={ this.state.assetData }
      options={ options }
      selectRow = { selectRow }
      deleteRow={true} insertRow={true}
      striped hover>
      {this.renderColumns()}
      </BootstrapTable>
      </div>);
    } else {
      return(null);
    }
  }
}

export default AssetTable

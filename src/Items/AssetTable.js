// Displays assets, allows creating and deleting
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
var ReactBsTable = require('react-bootstrap-table');
import {restRequest, handleErrors, handleServerError} from "../Utilities";
import AssetDetail from './AssetDetail';
import TypeConstants from '../TypeConstants';
import Select from 'react-select';
import InstaButtons from './InstaButtons';
import AlertComponent from '../AlertComponent';
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn
var Button = Bootstrap.Button;

class AssetTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      assetData: null,
      _fields: null,
      users: [],
      selectValues: [],
      userMap: [],
      shouldOpenModal: true,
      currentPage: 1,
      dataTotalSize: 0,
      selectedRows: []
    }
    this.requestAssets = this.requestAssets.bind(this);
    this.onAddRow = this.onAddRow.bind(this);
    this.onDeleteRow = this.onDeleteRow.bind(this);
    this.onAssetRowClick = this.onAssetRowClick.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.userSelectFormatter = this.userSelectFormatter.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.assetButtonFormatter = this.assetButtonFormatter.bind(this);
    this.onPageChange = this.onPageChange.bind(this);
    this.getSelectedAssets = this.getSelectedAssets.bind(this);
    this.onSelectRow = this.onSelectRow.bind(this);
  }

  componentWillMount() {
    this.requestAssets();
    this.getFieldData();
    this.getUsers();
  }

  componentDidMount() {
    console.log(this.state.selectedRows);
    /*for(var i = 0; i < this.state.selectedRows.length; i ++) {
      this._table.state.selectedRowKeys =
    }*/
  }

  requestAssets(pageNumber) {
    var pageParam = pageNumber
    if(pageParam == null) {
      pageParam = this.state.currentPage
    }
    var url = "/api/item/asset?item__id=" + this.props.id + "&page=" + pageParam + "&search"
    if(this.props.lightMode) {
      url = url + "&available=True";
    }
    if(this.props.isChangingCartType && this.props.filterType != null) {
      url = url + "&" + this.props.filterType + "__id=" + this.props.dispensementID;
    }
    restRequest("GET", url, "application/json", null,
    (responseText)=>{
      var response = JSON.parse(responseText);
      console.log("Getting Asset Response");
      console.log(response);
      let results = response.results;
      //If we're selecting, preselect any already selected assets
      let selectedRows = [];
      if(this.props.lightMode) {
        for(var i = 0; i < results.length; i ++) {
          console.log(this.props);
          if(results[i][this.props.filterType] != null &&
            results[i][this.props.filterType].id == this.props.dispensementID) {
            selectedRows.push(results[i].id);
          }
        }
      }
      console.log(selectedRows);
      this.setState({selectedRows: selectedRows});

      this.setState({assetData: results});
      this.setState({dataTotalSize: response.count});
    },
    ()=>{handleServerError(this._alertchild)});
  }

  getFieldData() {
    restRequest("GET", "/api/item/asset/field/", "application/json", null,
    (responseText)=>{
      var response = JSON.parse(responseText);
      console.log("Getting Custom Field Response in ItemTable");
      console.log(response);
      var results = response.results;
      this.setState({_fields: response.results});
    },
    ()=>{handleServerError(this._alertchild)}
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
  }, ()=>{handleServerError(this._alertchild)});
}

userSelectFormatter(cell, row) {
  return(
    <div onClick={()=>{this.state.shouldOpenModal=false;}}>
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
  if(row.disbursement != null) {
    return(<b> Disbursed to {row.disbursement.cart_owner}</b>);
  } else if(row.loan != null) {
    return(<b> Loaned to {row.loan.cart_owner}</b>);
  } else {
    //ID thing looks complicated, but it's just finding the username corresponding to
    //this asset using selectValues, then using that to find the appropriate user ID
    //using userMap
    return (
      <div onClick={()=>{this.state.shouldOpenModal=false;}} >
      <InstaButtons row={row} id={this.state.userMap[this.state.selectValues[row.asset_tag]]}
      alertchild={this._alertchild} updateCallback={this}/>
      </div>
    );
  }
}

onAddRow(row) {
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
    this._alertchild.generateSuccess("Successfully added asset");
  },
  (status, errResponse)=>{
    handleErrors(errResponse, this._alertchild);
  }
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
  }, ()=>{handleServerError(this._alertchild)});
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
  (status, errResponse)=>{
    handleErrors(errResponse, this._alertchild);
  });
}

onDeleteRow(rows) {
  var k = 1;
  for(var j = 0; j < rows.length; j ++) {
    restRequest("DELETE", "/api/item/asset/"+rows[j], "application/json", null,
        ()=>{
          console.log("Successfully deleted rows")
          console.log(j);
          if(k == rows.length) {
            this.requestAssets();
            this.props.updateCallback.getDetailedItem(this.props.id);
            this._alertchild.generateSuccess("Successfully deleted rows");
          }
          k ++;
        }, (status, errResponse)=>{
          this.handleErrors(errResponse, this._alertchild);
        });
  }
}

onAssetRowClick(row, isSelected, e) {
  if(this.state.shouldOpenModal) {
    this._assetDetail.openModal();
    this._assetDetail.getDetailedAsset(row.id);
  } else {
    this.state.shouldOpenModal = true;
  }
}

onPageChange(page, sizePerPage) {
    this.requestAssets(page);
    this.setState({
        currentPage: page
    })
}

getSelectedAssets() {
  return(this._table.state.selectedRowKeys);
}

renderColumns() {
  var cols = [];
  cols.push(<TableHeaderColumn key="id" dataField='id' autoValue={true} hiddenOnInsert hidden isKey></TableHeaderColumn>);
  cols.push(<TableHeaderColumn key="asset_tag" dataField='asset_tag' autoValue={true} hiddenOnInsert>Asset Tag</TableHeaderColumn>);
  for(var i = 0; i < this.state._fields.length; i++) {
    let name = this.state._fields[i].name;
    cols.push(<TableHeaderColumn key={name + "Col"} dataField={name} hidden>{name}</TableHeaderColumn>);
  }
  if(!this.props.lightMode) {
    cols.push(<TableHeaderColumn key="userCol" dataField='users' dataFormat={this.userSelectFormatter} dataAlign="center" hiddenOnInsert columnClassName='my-class'></TableHeaderColumn>);
    cols.push(<TableHeaderColumn key="buttonCol" dataField='button' dataFormat={this.assetButtonFormatter} dataAlign="center" hiddenOnInsert columnClassName='my-class'></TableHeaderColumn>);
  }
  return cols;
}

onSelectRow(row, isSelected, e) {
  console.log(isSelected);
  //selectedRowKeys.length is out of date, need to add or subtract 1 depending
  //on if a row was just selected or deselected.
  let newSelected = this.state.selectedRows;
  console.log(row);
  console.log(newSelected);
  if(isSelected) {
    newSelected.push(row.id);
  } else {
    newSelected.splice(newSelected.indexOf(row.id), 1);
  }
  console.log(newSelected);

  if(this.props.selectRowCallback != null) {
    this.props.selectRowCallback.updateNumRowsSelected(newSelected.length);
  }

  this.setState({selectedRows: newSelected});
}

render() {
  const selectRow = {
    mode: 'checkbox',
    onSelect: this.onSelectRow,
    selected: this.state.selectedRows
  };

  const options = {
    onAddRow: this.onAddRow,
    onDeleteRow: this.onDeleteRow,
    onRowClick: this.onAssetRowClick,
    onPageChange: this.onPageChange.bind(this),
    sizePerPageList: [ 30 ],
    sizePerPage: 30,
    page: this.state.currentPage
  };

  if((localStorage.isStaff === "true") && this.state.assetData != null) {
    return(
      <div>
      <p> <b> Instances of this Asset: </b> </p>
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      <AssetDetail ref={(child) => { this._assetDetail = child; }} />
      <BootstrapTable ref={(child) => { this._table = child; }}
      data={ this.state.assetData }
      options={ options }
      pagination={true}
      fetchInfo={ { dataTotalSize: this.state.dataTotalSize } }
      remote={true}
      selectRow = { selectRow }
      deleteRow={!this.props.lightMode} insertRow={!this.props.lightMode}
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

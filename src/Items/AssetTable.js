// Displays assets, allows creating and deleting
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
var ReactBsTable = require('react-bootstrap-table');
import {restRequest} from "../Utilities";
import AssetDetail from './AssetDetail';
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;

class AssetTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
          assetData: null,
          fields: null
        }
        this.requestAssets = this.requestAssets.bind(this);
        this.onAddRow = this.onAddRow.bind(this);
        this.onDeleteRow = this.onDeleteRow.bind(this);
        this.onAssetRowClick = this.onAssetRowClick.bind(this);
    }

    componentWillMount() {
      this.requestAssets();
      this.getFieldData();
    }

    requestAssets() {
      console.log("requesting assets");
      restRequest("GET", "/api/item/asset?item__id=" + this.props.id + "&search&available=True", "application/json", null,
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

    renderColumns() {
      var cols = [];
      cols.push(<TableHeaderColumn dataField='asset_tag' isKey>Asset Tag</TableHeaderColumn>);
      for(var i = 0; i < this.state._fields.length; i++) {
        let name = this.state._fields[i].name;
        cols.push(<TableHeaderColumn key={name + "Col"} dataField={name} hidden>{name}</TableHeaderColumn>);
      }
      return cols;
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
        this.requestAssets();
      },
      ()=>{console.log('GET Failed!!');}
      );
    }

    onDeleteRow(rows) {
      for(var i = 0; i < rows.length; i ++) {
        restRequest("DELETE", "/api/item/asset/" + this.state.assetData[i].id, "application/json", null,
        (responseText)=>{
          var response = JSON.parse(responseText);
          console.log("Getting delete asset response");
          console.log(response);
          this.requestAssets();
        },
        ()=>{console.log('GET Failed!!');}
        );
      }
    }

    onAssetRowClick(row, isSelected, e) {
      console.log("Asset Row Click");
      console.log(row);
      this._assetDetail.getDetailedAsset(row.id);
      this._assetDetail.openModal();
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

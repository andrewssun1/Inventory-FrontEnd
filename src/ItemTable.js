// bootstraptable.js
// Example to create a simple table using React Bootstrap table
// @author Andrew Sun

var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var Bootstrap = require('react-bootstrap');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;

import { hashHistory } from 'react-router';

var xhttp = new XMLHttpRequest();

class ItemTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      _products: [{
          "id": 111111111,
          "name": "siva",
          "quantity": null,
          "model_number": "12344567",
          "description": "This is super lit",
          "location": "Hudson",
          "tags": [{"tag": "first tag"}, {"tag": "second tag"}]
      }],
      _loginState: true
    };
    this.onAddRow = this.onAddRow.bind(this);
    this.onDeleteRow = this.onDeleteRow.bind(this);
  }

  componentWillMount() {
    // Get all items
    xhttp.open("GET", "https://asap-test.colab.duke.edu/api/item/", false);
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
    xhttp.send();
    if (xhttp.status === 401 || xhttp.status === 500){
      if(!!localStorage.token){
        delete localStorage.token;
      }
      this.setState({
        _loginState: false
      });
      hashHistory.push('/login');
      return null;
    }
    else{
      var response = JSON.parse(xhttp.responseText);
      this.setState({
        _products: response.results
      }, () => {
        for (var i = 0; i < this.state._products.length; i++){
              console.log(this.tagsToListString(this.state._products[i].tags));
              this.state._products[i]["tags"] = this.tagsToListString(this.state._products[i].tags);
            }
        });
    }
  }

  tagsToListString(tags) {
    var returnString = "";
    for (var i = 0; i < tags.length; i++){
      returnString = returnString.concat(tags[i].tag);
      if (i < tags.length-1){
        returnString = returnString.concat(", ");
      }
    }
    return returnString;
  }

  listToTags(s){
    var splitted = s.split(",");
    var returnList = [];
    for (var i = 0; i < splitted.length; i++){
      var tags = {};
      tags["tag"] = splitted[i].trim();
      returnList.push(tags);
    }
    return returnList;
  }

  onAddRow(row) {
    if (row){
        xhttp.open("POST", "https://asap-test.colab.duke.edu/api/item/", false);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
        if (xhttp.status === 401 || xhttp.status === 500){
          console.log('POST Failed!!');
        }
        else{
          row.quantity = parseInt(row.quantity);
          var a = JSON.parse(JSON.stringify(row)); // deep clone object
          this.state._products.push(row);
          a.tags = this.listToTags(a.tags);
          delete a.id;
          xhttp.send(JSON.stringify(a));
        }
    }
    console.log(this.state._products);
  }

  onDeleteRow(rows) {
    if(rows){
      this.setState({
        _products: this.state._products.filter((product) => {
          return rows.indexOf(product.name) === -1;
        })
      })
    }
    console.log(rows);
  }

  quantityValidator(value) {
    const nan = isNaN(parseInt(value, 10));
    if (nan) {
      return 'Quantity must be a integer!';
    }
    return true;
  }

  nameValidator(value) {
    if (!value || value === ""){
      return "Name must be at least one character!"
    }
    return true;
  }

    render() {
      // const options = {
      //   onRowMouseOver: function(row){
      //     row.style.cursor='pointer';
      //   }
      // }
      const selectRow = {
        mode: 'checkbox' //radio or checkbox
      };

      const options = {
        onAddRow: this.onAddRow,
        onDeleteRow: this.onDeleteRow
      }

        return(

            this.state._loginState ? (<BootstrapTable ref="table1" options={options} insertRow={true} selectRow={selectRow} data={this.state._products} deleteRow striped hover>
                <TableHeaderColumn isKey dataField='id' hidden hiddenOnInsert autoValue={true}>id</TableHeaderColumn>
                <TableHeaderColumn dataField='name' editable={ { validator: this.nameValidator} }>Name</TableHeaderColumn>
                <TableHeaderColumn dataField='quantity' editable={ { validator: this.quantityValidator} }>Quantity</TableHeaderColumn>
                <TableHeaderColumn dataField='model_number'>Model Number</TableHeaderColumn>
                <TableHeaderColumn dataField='description'>Description</TableHeaderColumn>
                <TableHeaderColumn dataField='location'>Location</TableHeaderColumn>
                <TableHeaderColumn dataField='tags'>Tags</TableHeaderColumn>
            </BootstrapTable>) : null

        )
    }
}

export default ItemTable;

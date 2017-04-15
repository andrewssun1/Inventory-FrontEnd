var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
import {restRequest, checkAuthAndAdmin} from "../Utilities.js"
import { Button } from 'react-bootstrap';


export default class BackfillTable extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      data: []
    }
    // this.onRowClick = this.onRowClick.bind(this);
  }

  componentWillMount(){
    this.resetTable();
  }

  resetTable(){
    this.getAllBackfills();
  }

  getAllBackfills() {
    checkAuthAndAdmin(()=>{
      restRequest("GET", "/api/request/backfill/", "application/json", null,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    for (var i = 0; i < response.results.length; i++) {
                      response.results[i].timestamp = moment(response.results[i].timestamp).format('lll');
                    }
                    this.setState({
                      data: response.results
                    });
                  }, ()=>{});
    });
  }

  formatPDF(cell, row){
    return (
      <Button href={row.pdf_url}>Download PDF</Button>
    );
  }

  render(){
    // const options = {
    //   onRowClick: this.onRowClick
    // };

    return(
      <div>
      <BootstrapTable ref="backfillTable" data={this.state.data} striped hover>
      <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden>id</TableHeaderColumn>
      <TableHeaderColumn dataField='status'>Status</TableHeaderColumn>
      <TableHeaderColumn dataField='timestamp'>Timestamp</TableHeaderColumn>
      <TableHeaderColumn dataField='quantity'>Quantity</TableHeaderColumn>
      <TableHeaderColumn dataField='pdf_url' dataAlign="center" dataFormat={this.formatPDF}>PDF</TableHeaderColumn>
      </BootstrapTable>
      </div>
    );
  }


}

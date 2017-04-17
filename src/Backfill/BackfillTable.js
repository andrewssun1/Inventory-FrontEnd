var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
import {restRequest, checkAuthAndAdmin} from "../Utilities.js"
import { Button } from 'react-bootstrap';
var moment = require('moment');



export default class BackfillTable extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      data: []
    }
  }

  formatPDF(cell, row){
    return (
      <Button bsStyle="link" href={row.pdf_url}>Download PDF</Button>
    );
  }

  approveBackfill(id){
    
  }

  render(){
    return(
      <div>
      <BootstrapTable ref="backfillTable" data={this.props.data} striped hover>
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

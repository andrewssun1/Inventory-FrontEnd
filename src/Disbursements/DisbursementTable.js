var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
import {restRequest, checkAuthAndAdmin} from "../Utilities.js"
import AlertComponent from "../AlertComponent";
import DisbursementModal from './DisbursementModal';

export default class DisbursementTable extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      data: []
    }
    this.onRowClick = this.onRowClick.bind(this);
  }

  componentWillMount(){
    // Get all disbursements
    checkAuthAndAdmin(()=>{
      restRequest("GET", "/api/disburse/", "application/json", null,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    for (var i = 0; i < response.results.length; i++){
                      response.results[i].disburser_name = response.results[i].disburser.username;
                      if (response.results[i].receiver !== null){
                        response.results[i].receiver_name = response.results[i].receiver.username;
                      }
                      else{
                        response.results[i].comment = "ACTIVE CART";
                      }
                      var disbursements = response.results[i].disbursements;
                      for (var j = 0; j < disbursements.length; j++){
                        disbursements[j].item_name = disbursements[j].item.name;
                      }
                    }
                    this.setState({
                      data: response.results
                    });
                  }, ()=>{});
    });
  }

  onRowClick(row){
    console.log(row);
    this.disbursementModal.openModal(row);
  }

  render(){
    // disburser name, receiver name, comment, onClick -> openModal
    const options = {
      onRowClick: this.onRowClick
    };

    return(
      <div>
      <DisbursementModal cb={this} ref={(child) => { this.disbursementModal = child; }} />
      <BootstrapTable ref="disbursementTable" options={options} data={this.state.data} striped hover>
      <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden>id</TableHeaderColumn>
      <TableHeaderColumn dataField='disburser_name'>Disburser Name</TableHeaderColumn>
      <TableHeaderColumn dataField='receiver_name'>Receiver Name</TableHeaderColumn>
      <TableHeaderColumn dataField='comment'>Comments</TableHeaderColumn>
      </BootstrapTable>
      </div>
    );
  }


}

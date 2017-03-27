var React = require('react');

import { Modal, Button } from 'react-bootstrap';
import AlertComponent from '../AlertComponent';
import ItemDetail from '../Items/ItemDetail';
import DisbursementModal from '../Disbursements/DisbursementModal';
import ViewRequestModal from '../Requests/ViewRequestModal';

export default class LogDetail extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      showModal: false,
      row: {
        initating_user: "",
        affected_user: "",
        action_tag: "",
        timestamp: "",
        comment: "",
        item_log: [],
        request_cart_log: []
      }
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.viewDetail = this.viewDetail.bind(this);
    this.shouldShowDetail = this.shouldShowDetail.bind(this);
  }

  openModal(row){
    this.setState({
      row: row,
      showModal: true
    })
  }

  closeModal(){
    this.setState({
      showModal: false
    })
  }

  viewDetail(){
    var row = this.state.row;
    if (row.item_log.length !== 0){
      this._child.getDetailedItem(row.item_log[0].item.id, ()=>{
        this._child.setState({showCartChange: false}, ()=>{this._child.openModal();});
      });
    }
    else if (row.request_cart_log.length !== 0){
      this.setState({selectedRequest: row.request_cart_log[0].request_cart.id}, ()=>{
        // get detailed view of shopping cart
        this._requestModal.getDetailedRequest(row.request_cart_log[0].request_cart.id, ()=>{
          this._requestModal.openModal();
        });
      });
    }
  }

  shouldShowDetail(){
    var row = this.state.row;
    return (row.item_log.length !== 0 && !this.props.cb.props.lightMode) || (row.request_cart_log.length !== 0)
  }

  render(){
    return(
      <div>
      <ItemDetail  ref={(child) => { this._child = child; }} updateCallback={this} />
      <ViewRequestModal id={this.state.selectedRequest}
        updateCallback={this}
        ref={(child) => { this._requestModal = child; }} />
      <Modal show={this.state.showModal}>
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      <Modal.Body>
        <div>
        <p><b>Initiating User: </b>{this.state.row.initiating_user}</p>
        <p><b>Affected User: </b>{this.state.row.affected_user}</p>
        <p><b>Action: </b>{this.state.row.action_tag}</p>
        <p><b>Timestamp: </b>{this.state.row.timestamp}</p>
        <p><b>Comments: </b>{this.state.row.comment}</p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div>
        {(this.shouldShowDetail()) ? <Button onClick={this.viewDetail} bsStyle="primary">View Detail</Button> : null}
        <Button onClick={this.closeModal} bsStyle="danger">Close</Button>
        </div>
      </Modal.Footer>
      </Modal>
      </div>
    );
  }

}

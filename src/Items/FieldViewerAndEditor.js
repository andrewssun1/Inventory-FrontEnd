//Displays detail modal with all properties of an ItemDetail
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
var ReactBsTable = require('react-bootstrap-table');
import TextEntryFormElement from '../TextEntryFormElement';
import MakeRequestModal from '../Requests/MakeRequestModal';
import ViewRequestModal from '../Requests/ViewRequestModal';
import TagComponent from '../Tags/TagComponent';
import TypeConstants from '../TypeConstants';
import LogQuantityChangeModal from './LogQuantityChangeModal';
import LogComponent from '../Logs/LogComponent';
import AssetDetail from './AssetDetail';
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
var Modal = Bootstrap.Modal;
var Button = Bootstrap.Button;
var Form = Bootstrap.Form;
var moment = require('moment');

import {restRequest, checkAuthAndAdmin} from "../Utilities.js";
import CartQuantityChooser from '../ShoppingCart/CartQuantityChooser';
import AlertComponent from '../AlertComponent';
import Select from 'react-select';

class FieldViewerAndEditor extends React.Component {

  constructor(props) {
    super(props);
    this.refDict = {};
    this.state = {
      itemData: null,
      selectedRequest: null,

    }
    this.saveEdits = this.saveEdits.bind(this);
    this.requestItem = this.requestItem.bind(this);
    this.getCarts = this.getCarts.bind(this);
    this.getDetailedItem = this.getDetailedItem.bind(this);
    this.populateFieldData = this.populateFieldData.bind(this);
    this.renderDisplayFields = this.renderDisplayFields.bind(this);
    this.renderEditFields = this.renderEditFields.bind(this);
    this.customFieldRequest = this.customFieldRequest.bind(this);
    this.typeCheck = this.typeCheck.bind(this);
  }

  render() {
    if(this.state.itemData == null) return null;

    const isStaff = (localStorage.isStaff === "true");

    return (
      <div>

      </div>
    )
  }
}

export default FieldViewerAndEditor

//Holds a button, and an id.
//The only reason this file exists is because Javascript is stupid
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import {restRequest, checkAuthAndAdmin, handleErrors, handleServerError} from "../Utilities";
import AlertComponent from '../AlertComponent';
import AssetTable from '../Items/AssetTable';
import SelectionType from './SelectionEnum.js'
var Modal = Bootstrap.Modal;
var Button = Bootstrap.Button;

class SelectAssetsButton extends React.Component {
  constructor(props) {
    super(props);
    this.onButtonClick = this.onButtonClick.bind(this);
  }

  onButtonClick() {
    console.log(this.props.cb);
    this.props.cb._selectAssetsModal.setState({itemID: this.props.itemID});
    this.props.cb._selectAssetsModal.setState({type: this.props.type});
    this.props.cb._selectAssetsModal.setState({dispensementID: this.props.dispensementID});
    this.props.cb._selectAssetsModal.setState({numAssetsNeeded: this.props.numAssetsNeeded});
    this.props.cb._selectAssetsModal.setState({assets: this.props.assets});
    this.props.cb._selectAssetsModal.setState({selectionType: SelectionType.DEFAULT});
    this.props.cb._selectAssetsModal.openModal();
  }

  render() {
    return (
        <Button onClick={this.onButtonClick} bsStyle={this.props.style}>{this.props.name}</Button>
    )
  }
}

export default SelectAssetsButton

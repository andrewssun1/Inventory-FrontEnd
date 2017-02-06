// Text entry element for React Bootstrap formHorizontalDescription
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
var FormGroup = Bootstrap.FormGroup;
var Col = Bootstrap.Col;
var ControlLabel = Bootstrap.ControlLabel;
var FormControl = Bootstrap.FormControl;

class TextEntryFormElement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: (this.props.initialValue == null) ? "" : this.props.initialValue
    }
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(evt) {
    this.setState({value: evt.target.value});
  }

  render() {
    return (
      <FormGroup controlId={this.props.controlId}>
      <Col componentClass={ControlLabel} sm={2}>
      {this.props.label}
      </Col>
      <Col sm={10}>
      <FormControl componentClass={this.props.componentClass} type={this.props.type} value={this.state.value} onChange={this.handleChange}/>
      </Col>
      </FormGroup>
    )
  }
}

export default TextEntryFormElement

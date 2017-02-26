// TagModal.js
// Modal for tags
// @author Andrew

var React = require('react');
var Bootstrap = require('react-bootstrap');
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import {Modal, Button} from 'react-bootstrap';
import {restRequest} from "./Utilities.js"

class TagModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption: "AND",
      showModal: false,
      tagOptions: [],
      includedValue: [],
      excludedValue: [],
      tagSearchResults: []
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.saveModal = this.saveModal.bind(this);
    this.handleSelectChangeIncluded = this.handleSelectChangeIncluded.bind(this);
    this.handleSelectChangeExcluded = this.handleSelectChangeExcluded.bind(this);
    this.handleOptionChange = this.handleOptionChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  componentDidMount() {
    //this.openModal();
  }

  openModal() {
    // Wants to get list of tags every time
    // Do REST API call
    restRequest("GET", "/api/item/tag/unique/", "application/json", null,
                (responseText)=>{
                  var allTags = [];
                  var response = JSON.parse(responseText);
                  var tagList = response.results;
                  for (var i = 0; i < tagList.length; i++){
                    allTags.push({label: tagList[i].tag, value: tagList[i].tag});
                  }
                  this.setState({tagOptions: allTags, showModal: true});
                }, ()=>{console.log('GET Failed!!');});
  }

  saveModal(){
    this.props.updateCallback.setState({_products: this.state.tagSearchResults});
    this.closeModal();
  }

  closeModal() {
    this.setState({showModal: false});
  }

  handleSelectChangeIncluded (value) {
    console.log('You\'ve selected:', value);
    this.setState({ includedValue: value });
  }

  handleSelectChangeExcluded (value) {
    console.log('You\'ve selected:', value);
    this.setState({ excludedValue: value });
  }

  handleOptionChange (e) {
    this.setState({
      selectedOption: e.target.value
    });
  }

  handleSearch() {
    // console.log(this.state.includedValue);
    // console.log(this.state.excludedValue);
    var includedString = this.state.includedValue.length === 0 ? "" : "tag_included=" + this.state.includedValue + "&";
    var excludedString = this.state.excludedValue.length === 0 ? "" : "tag_excluded=" + this.state.excludedValue + "&";
    var completeString = includedString + excludedString + "operator=AND";

    var formatIncluded = this.state.includedValue.length === 0 ? "" : "Included Tags: " + this.state.includedValue + " ";
    var formatExcluded = this.state.excludedValue.length === 0 ? "" : " Excluded Tags: " + this.state.excludedValue;
    var completeFormat = formatIncluded + ((includedString===""||excludedString==="") ? "" : this.state.selectedOption) + formatExcluded;

    console.log(completeFormat);
    var url_parameter = "?" + completeString
      this.props.updateCallback.setState({
          currentSearchURL: url_parameter
      });
      this.props.updateCallback.getAllItem(url_parameter);
      this.props.updateCallback.setState({tagSearchText: completeFormat});
      this.closeModal();
    //}
  }

  render() {
    //TODO: Add in image
    return (
      <div>
      <Bootstrap.Modal show={this.state.showModal}>
      <Modal.Body>
        <div className="section">
  				<h3 className="section-heading">Search Tags</h3>
          <h5 className="section-heading">Included Tags</h5>
  				<Select multi simpleValue value={this.state.includedValue} placeholder="Select tag(s)" options={this.state.tagOptions} onChange={this.handleSelectChangeIncluded} />
          <h5 className="section-heading">Excluded Tags</h5>
          <Select multi simpleValue value={this.state.excludedValue} placeholder="Select tag(s)" options={this.state.tagOptions} onChange={this.handleSelectChangeExcluded} />
        </div>

      </Modal.Body>
      <Modal.Footer>
        <div>
        <Button onClick={this.handleSearch} bsStyle="primary">Search</Button>
        <Button onClick={this.closeModal} bsStyle="danger">Cancel</Button>
        </div>
      </Modal.Footer>
      </Bootstrap.Modal>
      </div>
    )
  }
}

export default TagModal

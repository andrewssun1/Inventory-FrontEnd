// TagModal.js
// Modal for tags
// @author Andrew

var React = require('react');
var Bootstrap = require('react-bootstrap');
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import {Modal, Button, Radio, ButtonGroup, Input} from 'react-bootstrap'

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
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "https://asap-production.colab.duke.edu/api/item/tag/unique/", false);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
    xhttp.send();
    if (xhttp.status === 401 || xhttp.status === 500){
      console.log('GET Failed!!');
    }
    else{
      var response = JSON.parse(xhttp.responseText);
      var tagList = response.results;
      for (var i = 0; i < tagList.length; i++){
        this.state.tagOptions.push({label: tagList[i].tag, value: tagList[i].tag});
      }
    }
    this.setState({showModal: true});
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
    var completeString = includedString + excludedString + "operator=" + this.state.selectedOption;

    var formatIncluded = this.state.includedValue.length === 0 ? "" : "Included Tags: " + this.state.includedValue + " ";
    var formatExcluded = this.state.excludedValue.length === 0 ? "" : " Excluded Tags: " + this.state.excludedValue;
    var completeFormat = formatIncluded + ((includedString===""||excludedString==="") ? "" : this.state.selectedOption) + formatExcluded;

    console.log(completeFormat);
    //this.closeModal();
    // var xhttp = new XMLHttpRequest();
    // xhttp.open("GET", "https://asap-production.colab.duke.edu/api/item/?"+completeString, false);
    // xhttp.setRequestHeader("Content-Type", "application/json");
    // xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
    // xhttp.send();
    // if (xhttp.status === 401 || xhttp.status === 500){
    //   console.log('GET Failed!!');
    // }
    // else{
    //   // var response = JSON.parse(xhttp.responseText);
    //   // var itemList = response.results;
    //   // //console.log(this.props);
    //   // for (var i = 0; i < itemList.length; i++){
    //   //     itemList[i]["tags"] = this.props.updateCallback.tagsToListString(itemList[i].tags);
    //   // }
    //   // this.setState({tagSearchResults: itemList});
    //   // console.log("Resulting list: ");
    //   // console.log(itemList);
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
          <div className="text-center">
          <p>  </p>
          <ButtonGroup>
          <Radio inline value="AND" checked={this.state.selectedOption === "AND"} onChange={this.handleOptionChange}>
              AND
              </Radio>
              {' '}
              <Radio inline value="OR" checked={this.state.selectedOption === "OR"} onChange={this.handleOptionChange}>
              OR
              </Radio>
          </ButtonGroup>
          </div>
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

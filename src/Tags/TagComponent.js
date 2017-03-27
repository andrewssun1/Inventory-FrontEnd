var React = require('react');
import TagTable from './TagTable'
import { restRequest, checkAuthAndAdmin } from '../Utilities'
import Select from 'react-select';

class TagComponent extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            data: this.props.item_detail,
            selected: [],
            isStaff: false,
            item_id: this.props.item_id,
            tagOptions: [],
            includedValue: [],
            tagDict: {}
        }
        this.handleSelectChange = this.handleSelectChange.bind(this);
        this.addTag = this.addTag.bind(this);
        this.deleteTag = this.deleteTag.bind(this);
    }

    componentWillMount(){
        checkAuthAndAdmin(()=>{
          this.setState({
              isStaff: (localStorage.isStaff === 'true')
          })
          console.log(this.props.item_detail);
          for (var i = 0; i < this.props.item_detail.length; i++){
            var currTag = this.props.item_detail[i];
            this.state.tagDict[currTag.tag] = currTag.id;
            this.state.includedValue.push(currTag.tag);
          }
          restRequest("GET", "/api/item/tag/unique/", "application/json", null,
                      (responseText)=>{
                        var allTags = [];
                        var response = JSON.parse(responseText);
                        var tagList = response.results;
                        for (var i = 0; i < tagList.length; i++){
                          allTags.push({label: tagList[i].tag, value: tagList[i].tag});
                        }
                        this.setState({tagOptions: allTags});
                      }, ()=>{console.log('GET Failed!!');});
        });
    }

    addTag(tag){
      var data = {
          "item" : this.props.item_id,
          "tag"  : tag
      };
      restRequest("POST", "/api/item/tag/", "application/json", JSON.stringify(data),
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    var temp_data = this.state.data;
                    this.state.tagDict[response.tag] = response.id;
                    console.log("Successfully added: ", tag);
                  },
                ()=>{
                  console.log('POST Failed!!');
                })
    }

    deleteTag(tag){
      var tagId = this.state.tagDict[tag];
      restRequest("DELETE", "/api/item/tag/"+tagId, "application/json", null,
                  ()=>{
                    console.log("Successfully deleted: ", tag);
                  },
                ()=>{alert("DELETE FAILED. Please contact system admin.")});
    }

    handleSelectChange (value) {
      var newList = value.split(",");
      console.log(newList);
      var oldList = this.state.includedValue;
      // added new tag
      if (newList.length > oldList.length || oldList[0] === "") {
        // find added tag
        var diff = newList.filter(x => oldList.indexOf(x) === -1);
        this.addTag(diff[0]);
        console.log("New tag: ", diff);
      }
      // deleted a tag
      else if (newList.length < oldList.length || newList[0] === "") {
        // find deleted tag
        var diff = oldList.filter(x => newList.indexOf(x) === -1);
        this.deleteTag(diff[0]);
        console.log("Removed tag: ", diff);
      }
      this.setState({ includedValue: newList });
      this.props.cb.props.updateCallback.componentWillMount();
    }

    render(){
        return(
          <Select.Creatable disabled={localStorage.isStaff === "false"} clearable={false} multi simpleValue value={this.state.includedValue} placeholder="Select tag(s)" options={this.state.tagOptions} onChange={this.handleSelectChange} />
        )
    }
}

export default TagComponent;

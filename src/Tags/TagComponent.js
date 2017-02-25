var React = require('react');
import TagTable from './TagTable'
import { restRequest, checkAuthAndAdmin } from '../Utilities'

class TagComponent extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            data: this.props.item_detail,
            selected: [],
            isSuperUser: false,
            item_id: this.props.item_id
        }
    }

    componentWillMount(){
        checkAuthAndAdmin(()=>{
          this.setState({
              isSuperUser: localStorage.isSuperUser === 'true'
          })
        });
    }

    onAddRow(row) {
      var data = {
          "item" : this.props.item_id,
          "tag"  : row.tag
      };
      restRequest("POST", "/api/item/tag/", "application/json", JSON.stringify(data),
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    var temp_data = this.state.data;
                    temp_data.push({
                        "id": response.id,
                        "tag": response.tag
                    })
                    this.setState({
                        data: temp_data
                    })
                  },
                ()=>{
                  console.log('POST Failed!!');
                })
    }

    onDeleteRow(rows) {
            for (let i = 0; i < rows.length; i++){
              restRequest("DELETE", "/api/item/tag/"+rows[i], "application/json", null,
                          ()=>{
                            this.setState({
                                data: this.state.data.filter((product) => {
                                    return rows.indexOf(product.id) === -1;
                                })
                            });
                          },
                        ()=>{alert("DELETE FAILED. Please contact system admin.")});
            }
    }

    render(){
        const selectRowProp = this.state.isSuperUser ? {
                mode: 'checkbox' //radio or checkbox
            } : {};

        const options = this.state.isSuperUser ? {
            onAddRow: this.onAddRow.bind(this),
            onDeleteRow: this.onDeleteRow.bind(this)
        } : {};

        return(
            <TagTable ref="tagTable" selectRowProp={selectRowProp} options={options} {...this.state}/>
        )
    }
}

export default TagComponent;

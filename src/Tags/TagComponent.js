var React = require('react');
import TagTable from './TagTable'
import { restRequest, checkAuthAndAdmin } from '../Utilities'

class TagComponent extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            data: this.props.item_detail,
            selected: [],
            isAdmin: false,
            item_id: this.props.item_id
        }
    }

    componentWillMount(){
        checkAuthAndAdmin(()=>{
          this.setState({
              isAdmin: localStorage.isAdmin === 'true'
          })
        });
    }

    onAddRow(row) {
      var data = {
          "item" : this.props.item_id,
          "tag"  : row.tag
      };
      restRequest("POST", "/item/tag/", "application/json", JSON.stringify(data),
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
              restRequest("DELETE", "/item/tag/"+rows[i], "application/json", null,
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
        const selectRowProp = this.state.isAdmin ? {
                mode: 'checkbox' //radio or checkbox
            } : {};

        const options = this.state.isAdmin ? {
            onAddRow: this.onAddRow.bind(this),
            onDeleteRow: this.onDeleteRow.bind(this)
        } : {};

        return(
            <TagTable selectRowProp={selectRowProp} options={options} {...this.state}/>
        )
    }
}

export default TagComponent;

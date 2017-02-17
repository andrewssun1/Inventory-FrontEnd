var React = require('react');
import TagTable from './TagTable'
import { restRequest, checkAuthAndAdmin } from '../Utilities'

var xhttp = new XMLHttpRequest();

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
        // if (row){
        //     xhttp.open('POST', "https://asap-test.colab.duke.edu/api/item/tag/", false);
        //     xhttp.setRequestHeader("Content-Type", "application/json");
        //     xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
        //     var data = {
        //         "item" : this.props.item_id,
        //         "tag"  : row.tag
        //     };
        //     xhttp.send(JSON.stringify(data));
        //     if (xhttp.status === 401 || xhttp.status === 500){
        //         console.log('POST Failed!!');
        //     }
        //     else{
        //         var response = JSON.parse(xhttp.responseText);
        //         var temp_data = this.state.data;
        //         temp_data.push({
        //             "id": response.id,
        //             "tag": response.tag
        //         })
        //         this.setState({
        //             data: temp_data
        //         })
        //     }
        // }
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
                // xhttp.open("DELETE", "https://asap-test.colab.duke.edu/api/item/tag/"+rows[i], false);
                // xhttp.setRequestHeader("Content-Type", "application/json");
                // xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
                // xhttp.send();
                // if (xhttp.status === 401 || xhttp.status === 500 || xhttp.status === 405){
                //     alert("DELETE FAILED. Please contact system admin.")
                // }
                // this.setState({
                //     data: this.state.data.filter((product) => {
                //         return rows.indexOf(product.id) === -1;
                //     })
                // })
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

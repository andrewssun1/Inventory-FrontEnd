// Displays everything on the item page
// @author Patrick Terry

var React = require('react');
import ItemTable from './ItemTable';
import {checkAuthAndAdmin} from "../Utilities";
import CustomFieldTable from './CustomFieldTable';

class ItemComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isSuperUser: false,
        }
    }

    componentWillMount(){
        checkAuthAndAdmin(()=>{
            this.setState({isSuperUser: (localStorage.isSuperUser === "true")})
        })
    }

    render() {
        return (
            <div>
              <ItemTable ref="itemTable"/>
                {this.state.isSuperUser ?
                    <div>
                      <h2> Custom Fields </h2>
                      <CustomFieldTable apiSource="/api/item/field/"/>
                      <br />
                      <h2> Asset Fields </h2>
                      <CustomFieldTable apiSource="/api/item/asset/field/"/>
                    </div>
                    : null}
            </div>
        )
    }
}

export default ItemComponent

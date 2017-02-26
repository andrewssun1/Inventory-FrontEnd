// Displays everything on the item page
// @author Patrick Terry

var React = require('react');
import ItemTable from './ItemTable';
import CustomFieldTable from './CustomFieldTable';

class ItemComponent extends React.Component {
  render() {
    console.log(localStorage);
    const isSuperUser = (localStorage.isSuperUser == "true");

    return (
      <div>
      <ItemTable ref="itemTable"/>
      {isSuperUser ?
        <div>
        <h2> Custom Fields </h2>
        <CustomFieldTable />
        </div>
         : null}
      </div>
    )
  }
}

export default ItemComponent

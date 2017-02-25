// Displays everything on the item page
// @author Patrick Terry

var React = require('react');
import ItemTable from './ItemTable';
import CustomFieldTable from './CustomFieldTable';

class ItemComponent extends React.Component {
  render() {
    const isAdmin = (localStorage.isAdmin == "true");

    return (
      <div>
      <ItemTable ref="itemTable"/>
      {isAdmin ?
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

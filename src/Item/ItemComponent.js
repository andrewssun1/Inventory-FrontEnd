// Displays everything on the item page
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import ItemTable from './ItemTable';
import CustomFieldTable from './CustomFieldTable';

class ItemComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const isAdmin = (localStorage.isAdmin == "true");

    return (
      <div>
      <ItemTable />
      <h2> Custom Fields </h2>
      {isAdmin ? <CustomFieldTable /> : null}
      </div>
    )
  }
}

export default ItemComponent

// Displays everything on the item page
// @author Patrick Terry

var React = require('react');
import ItemTable from './ItemTable';

class ItemComponent extends React.Component {
  render() {
    return (
      <ItemTable />
    )
  }
}

export default ItemComponent

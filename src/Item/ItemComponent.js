// Displays everything on the item page
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import ItemTable from './ItemTable';

class ItemComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ItemTable />
    )
  }
}

export default ItemComponent

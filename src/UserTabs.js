// simpletabs.js
// creation of some simple tabs
// @author Andrew

import ItemTable from './ItemTable'

var React = require('react');
var ReactDOM = require('react-dom');
var ReactBootstrap = require('react-bootstrap');

var Tab = ReactBootstrap.Tab;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Nav = ReactBootstrap.Nav;
var NavItem = ReactBootstrap.NavItem;

export default class UserTabs extends React.Component {

  constructor(props) {
  super(props);
  console.log("hellooooo")
  this.state = {
    key: 2
  };
}

  handleTabChange = (key) => {
  this.setState({
    key
  }, () => {
    /*
     * If you enable animation in react-bootstrap tab
     * please remember to call forceUpdate in async call.
     * If disable animation, call forceUpdate directly.
     */
    if (key === "items") {
      setTimeout(() => {
        this.refs.table1.forceUpdate();
      }, 500);
    }
  });
}

  render() {
       return (
         <ReactBootstrap.Tab.Container id="left-tabs-example" defaultActiveKey="home" onSelect={ this.handleTabChange }>
           <Row className="clearfix">
             <Col sm={2}>
               <Nav bsStyle="pills" stacked>
                 <NavItem eventKey="home">
                   Home
                 </NavItem>
                 <NavItem eventKey="items">
                   Items
                 </NavItem>
                 <NavItem eventKey="requests">
                   Requests
                 </NavItem>
                 <NavItem eventKey="settings">
                   Settings
                 </NavItem>
               </Nav>
             </Col>
             <Col sm={8}>
               <Tab.Content animation>
                 <Tab.Pane eventKey="home">
                   Home page goes here
                 </Tab.Pane>
                 <Tab.Pane eventKey="items">
                     <ItemTable ref="table1"></ItemTable>
                 </Tab.Pane>
                 <Tab.Pane eventKey="requests">
                   Requests go here
                 </Tab.Pane>
                 <Tab.Pane eventKey="settings">
                   Settings go here
                 </Tab.Pane>
               </Tab.Content>
             </Col>
           </Row>
         </ReactBootstrap.Tab.Container>
       );
     }

}

//ReactDOM.render(tabsInstance, document.getElementById('root'));

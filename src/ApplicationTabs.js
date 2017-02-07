// simpletabs.js
// creation of some simple tabs
// @author Andrew

import ItemTable from './ItemTable';
import { checkAuthAndAdmin } from './Utilities';
import LogComponent from './LogComponent/LogComponent'
import RequestComponent from './RequestComponent/RequestComponent'
import TagModal from './TagModal'
import ManageUsers from './ManageUsers'

var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Tab = ReactBootstrap.Tab;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Nav = ReactBootstrap.Nav;
var NavItem = ReactBootstrap.NavItem;

export default class ApplicationTabs extends React.Component {

  constructor(props) {
  super(props);
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

  componentWillMount(){
    checkAuthAndAdmin()
  }

  render() {
      const isAdmin = (localStorage.isAdmin == "true");
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
                   {isAdmin ? (<NavItem eventKey="logs">
                     Logs
                   </NavItem>) : null
                   }
                   {isAdmin ? (<NavItem eventKey="users">
                     Manage Users
                   </NavItem>) : null
                   }
               </Nav>
             </Col>
             <Col sm={8}>
               <Tab.Content animation>
                 <Tab.Pane eventKey="home">
                   You are in the user homepage. Welcome {localStorage.username}!
                   Unfortunately, this page is still being built :D :/ Sorry
                 </Tab.Pane>
                 <Tab.Pane eventKey="items">
                     <ItemTable ref="table1"></ItemTable>
                 </Tab.Pane>
                 <Tab.Pane eventKey="requests">
                   <RequestComponent ref="requestComponent"></RequestComponent>
                 </Tab.Pane>
                 <Tab.Pane eventKey="logs">
                   <LogComponent ref="logComp"></LogComponent>
                 </Tab.Pane>
                 {isAdmin ? (
                 <Tab.Pane eventKey="users">
                   <ManageUsers ref="manage"></ManageUsers>
                 </Tab.Pane>) : null}
               </Tab.Content>
             </Col>
           </Row>
         </ReactBootstrap.Tab.Container>
       );
     }

}

//ReactDOM.render(tabsInstance, document.getElementById('root'));

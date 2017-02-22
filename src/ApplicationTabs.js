// simpletabs.js
// creation of some simple tabs
// @author Andrew

import ItemComponent from './Item/ItemComponent';
import { restRequest, checkAuthAndAdmin } from './Utilities';
import LogComponent from './LogComponent/LogComponent'
import RequestComponent from './Request/RequestComponent'
import TagModal from './TagModal'
import ManageUsers from './ManageUsers'
import ShoppingCartTable from './ShoppingCartTable'

var React = require('react');
var ReactBootstrap = require('react-bootstrap');
import {Tab, Row, Col, Nav, NavItem, Glyphicon} from 'react-bootstrap';

export default class ApplicationTabs extends React.Component {

  constructor(props) {
  super(props);
  this.state = {
    key: 2,
    cart_quantity: 0
  };
  this.onCartChanged = this.onCartChanged.bind(this);
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
        this.refs.itemComponent.forceUpdate();
      }, 500);
    }
  });
}

  componentWillMount(){
    checkAuthAndAdmin(()=>{})
  }

  componentDidMount(){
    if (!localStorage.cart_quantity){
      localStorage.cart_quantity = 0;
    }
    var originalSetItem = localStorage.setItem;
    // TODO: Get cart here!
    restRequest("GET", "/api/shoppingCart/active/", "application/JSON", null,
                (responseText)=>{
                  var response = JSON.parse(responseText);
                  var currCart = response.id;
                  restRequest("GET", "/api/shoppingCart/detailed/"+currCart+"/", "application/JSON", null,
                              (responseText)=>{
                                var detailResponse = JSON.parse(responseText);
                                localStorage.setItem("cart_quantity", detailResponse.requests.length);
                                console.log(JSON.parse(responseText));
                              }, (status, responseText)=>{console.log(JSON.parse(responseText))});
                  //console.log(response);
                }, (status, responseText)=>{console.log(JSON.parse(responseText))});

    localStorage.setItem = function(){
        var eve = document.createEvent('Event')
        eve.initEvent('itemInserted', true, true);
        originalSetItem.apply(this, arguments);
        window.dispatchEvent(eve);
    }
    window.addEventListener("itemInserted", this.onCartChanged);
  }

  onCartChanged(){
    this.setState({cart_quantity: localStorage.cart_quantity});
  }

  render() {
      const isAdmin = (localStorage.isAdmin === "true");
       return (
         <ReactBootstrap.Tab.Container id="left-tabs-example" defaultActiveKey="home" onSelect={ this.handleTabChange }>
           <Row className="clearfix">
             <Col sm={2}>
               <Nav bsStyle="pills" stacked>
                 <NavItem eventKey="home">
                   <Glyphicon style={{marginRight: "8px"}} glyph="home" />Home
                 </NavItem>
                 <NavItem eventKey="items">
                   <Glyphicon style={{marginRight: "8px"}} glyph="th-list" />Items
                 </NavItem>
                 <NavItem eventKey="requests">
                   <Glyphicon style={{marginRight: "8px"}} glyph="question-sign" />Requests
                 </NavItem>
                   {isAdmin ? (<NavItem eventKey="logs">
                     <Glyphicon style={{marginRight: "8px"}} glyph="pencil" />Logs
                   </NavItem>) : null
                   }
                   {isAdmin ? (<NavItem eventKey="users"><Glyphicon style={{marginRight: "8px"}} glyph="briefcase" />Manage Users
                   </NavItem>) : null
                   }
                   <NavItem eventKey="cart">
                     <Glyphicon style={{marginRight: "8px"}} glyph="shopping-cart" />{"Cart ("+this.state.cart_quantity+")"}
                   </NavItem>
               </Nav>
             </Col>
             <Col sm={8}>
               <Tab.Content animation>
                 <Tab.Pane eventKey="home">
                   You are in the user homepage. Welcome {localStorage.username}!
                 </Tab.Pane>
                 <Tab.Pane eventKey="items">
                     <ItemComponent ref="itemComponent"></ItemComponent>
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
                 <Tab.Pane eventKey="cart">
                   <ShoppingCartTable ref="shoppingCartTable"></ShoppingCartTable>
                 </Tab.Pane>
               </Tab.Content>
             </Col>
           </Row>
         </ReactBootstrap.Tab.Container>
       );
     }

}

//ReactDOM.render(tabsInstance, document.getElementById('root'));

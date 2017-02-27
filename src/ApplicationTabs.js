// ApplicationTabs.js
// Creates the tab structure for the application
// @author Andrew

import ItemComponent from './Items/ItemComponent';
import { restRequest, checkAuthAndAdmin } from './Utilities';
import LogComponent from './Logs/LogComponent'
import RequestComponent from './Requests/RequestComponent'
import ManageUsersComponent from './ManageUsersComponent'
import ShoppingCartTable from './ShoppingCart/ShoppingCartTable'
import SettingsComponent from './SettingsComponent'
import DisbursementTable from './Disbursements/DisbursementTable'

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
      this.refs.itemComponent.refs.itemTable._alertchild.closeAlert();
      this.refs.itemComponent.refs.itemTable.componentWillMount();
      setTimeout(() => {
        this.refs.itemComponent.forceUpdate();
      }, 500);
    }
    else if (key === "cart"){
      this.refs.shoppingCartTable.componentDidMount();
      // this.refs.shoppingCartTable.refs.shoppingCart.refs.body.refs.cartChooser.forceUpdate();
      // this.refs.shoppingCartTable.refs.chooser.forceUpdate();
      this.refs.shoppingCartTable._alertchild.closeAlert();
    }
    else if (key === "requests"){
      this.refs.requestComponent.refs.requestTable._alertchild.closeAlert();
      this.refs.requestComponent.refs.requestTable.componentWillMount();
    }
  });
}

  componentWillMount(){
    checkAuthAndAdmin(()=>{})
  }

  // TODO: should this be added to component will mount?
  componentDidMount(){
    if (!localStorage.cart_quantity){
      localStorage.cart_quantity = 0;
    }
    var originalSetItem = localStorage.setItem;
    // TODO: Get cart here!
    const isStaff = (localStorage.isStaff === "true");
    var url = isStaff ? "/api/disburse/active/" : "/api/shoppingCart/active/";
    restRequest("GET", url, "application/JSON", null,
                (responseText)=>{
                  var response = JSON.parse(responseText);
                  localStorage.activecartid = response.id;
                  var disburseRequest = isStaff ? response.disbursements : response.requests;
                  localStorage.setItem("cart_quantity", disburseRequest.length);
                  console.log(response);
                }, (status, responseText)=>{console.log(JSON.parse(responseText))});

    // 10TH GRADE MAGICS
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
      const isSuperUser = (localStorage.isSuperUser === "true");
      const isStaff = (localStorage.isStaff === "true");
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
                 <NavItem eventKey="disbursements">
                   <Glyphicon style={{marginRight: "8px"}} glyph="cloud-upload" />Disbursements
                 </NavItem>
                   {isStaff ? (<NavItem eventKey="logs">
                     <Glyphicon style={{marginRight: "8px"}} glyph="pencil" />Logs
                   </NavItem>) : null
                   }
                   {isSuperUser ? (<NavItem eventKey="users"><Glyphicon style={{marginRight: "8px"}} glyph="briefcase" />Manage Users
                   </NavItem>) : null
                   }
                   <NavItem eventKey="settings">
                     <Glyphicon style={{marginRight: "8px"}} glyph="wrench" />Settings
                   </NavItem>
                   <NavItem eventKey="cart">
                     <Glyphicon style={{marginRight: "8px"}} glyph="shopping-cart" />{"Cart ("+this.state.cart_quantity+")"}
                   </NavItem>
               </Nav>
             </Col>
             <Col sm={9}>
               <Tab.Content animation>
                 <Tab.Pane eventKey="home">
                   <div>
                   <p> You are in the user homepage. Welcome {localStorage.username}! </p>
                    </div>
                 </Tab.Pane>
                 <Tab.Pane eventKey="items">
                     <ItemComponent ref="itemComponent"></ItemComponent>
                 </Tab.Pane>
                 <Tab.Pane eventKey="requests">
                   <RequestComponent ref="requestComponent"></RequestComponent>
                 </Tab.Pane>
                 <Tab.Pane eventKey="disbursements">
                   <DisbursementTable ref="disbursementComponent"></DisbursementTable>
                 </Tab.Pane>
                 <Tab.Pane eventKey="logs">
                   <LogComponent ref="logComp"></LogComponent>
                 </Tab.Pane>
                 {isSuperUser ? (
                 <Tab.Pane eventKey="users">
                   <ManageUsersComponent ref="manage"></ManageUsersComponent>
                 </Tab.Pane>) : null}
                 <Tab.Pane eventKey="settings">
                   <SettingsComponent />
                 </Tab.Pane>
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

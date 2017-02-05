import React from 'react';
import ReactDOM from 'react-dom';
import UserTabs from './UserTabs'
import LoginPage from './LoginPage'
import { Router, IndexRoute, Route, hashHistory } from 'react-router';



ReactDOM.render(
  <Router history={hashHistory}>
    <Route path='/' component={UserTabs}></Route>

  </Router>,
  document.getElementById('root')
);

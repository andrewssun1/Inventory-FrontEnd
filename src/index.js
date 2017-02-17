import React from 'react';
import ReactDOM from 'react-dom';
import ApplicationTabs from './ApplicationTabs'
import LoginPage from './LoginPage'
import MasterPage from './MasterPage'
import { Router, Route, hashHistory } from 'react-router';


function requireAuth(nextState, replace){
  if (!localStorage.token) {
    replace({
      pathname: '/login'
    })
  }
}

const stuff = (
  <Router history={hashHistory}>
    <Route path='/' component={MasterPage}>
      <Route path='/login' component={LoginPage}></Route>
      <Route onEnter={requireAuth}>
        <Route path='/main' component={ApplicationTabs}></Route>
      </Route>
    </Route>
  </Router>
);

ReactDOM.render(
stuff,
  document.getElementById('root')
);

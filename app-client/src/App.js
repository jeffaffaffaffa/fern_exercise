import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';
import { MuiThemeProvider } from '@material-ui/core/styles';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import appStyling from './util/theme';
import jwtDecode from 'jwt-decode';

//components
import Navbar from './components/Navbar';
import AuthRoute from './util/AuthRoute';

//pages
import home from './pages/home';
import login from './pages/login';
import signup from './pages/signup';

const theme = createMuiTheme(appStyling);

//decodes token
let authenticated;
const token = localStorage.FBIdToken;
if (token) {
  const decodedToken = jwtDecode(token);
  console.log(decodedToken);
  //checks if the token is expired
  if (decodedToken.exp * 1000 < Date.now()) {
    //if it is, redirect and set auth to false
    window.location.href = '/login';
    authenticated = false;
  } else {
    authenticated = true;
  }
}

class App extends Component {
  render() {
    return (
      <MuiThemeProvider theme = { theme }>
        <div className="App">
        <Router>
          <Navbar/>
            <div className = "container">
              <Switch>
                <Route exact path="/" component={ home }/>
                <AuthRoute exact path="/login" component={ login } authenticated={authenticated}/>
                <AuthRoute exact path="/signup" component={ signup } authenticated={authenticated}/>
              </Switch>
            </div>
          </Router>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;

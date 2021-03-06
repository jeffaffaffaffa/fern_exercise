import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';
import { MuiThemeProvider } from '@material-ui/core/styles';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import appStyling from './util/theme';
import jwtDecode from 'jwt-decode';
import axios from 'axios';

//redux
import { Provider } from 'react-redux';
import store from './redux/store';
import { SET_AUTHENTICATED } from './redux/types';
import { logoutUser, getUserData } from './redux/actions/userActions';

//components
import Navbar from './components/layout/Navbar';
import AuthRoute from './util/AuthRoute';

//pages
import home from './pages/home';
import login from './pages/login';
import signup from './pages/signup';
import user from './pages/user';

const theme = createMuiTheme(appStyling);

axios.defaults.baseURL = 'https://us-central1-react-firebase-exercise-a96db.cloudfunctions.net/api';

//decodes token
const token = localStorage.FBIdToken;
if (token) {
  const decodedToken = jwtDecode(token);
  console.log(decodedToken);
  //checks if the token is expired
  if (decodedToken.exp * 1000 < Date.now()) {
    //if it is, redirect and set auth to false
    store.dispatch(logoutUser())
    window.location.href = '/login';
  } else {
    store.dispatch({ type: SET_AUTHENTICATED });
    axios.defaults.headers.common['Authorization'] = token;
    store.dispatch(getUserData());
  }
}

class App extends Component {
  render() {
    return (
      <MuiThemeProvider theme = { theme }>
        <Provider store={store}>
          <Router>
          <Navbar/>
            <div className = "container">
              <Switch>
                <Route exact path="/" component={ home }/>
                <AuthRoute exact path="/login" component={ login }/>
                <AuthRoute exact path="/signup" component={ signup }/>
                <Route exact path="/users/:username" component={ user }/>
                <Route exact path="/users/:username/posts/:postId" component={ user }/>
              </Switch>
            </div>
          </Router>
        </Provider>
      </MuiThemeProvider>
    );
  }
}

export default App;

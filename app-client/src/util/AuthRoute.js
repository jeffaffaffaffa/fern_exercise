import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const AuthRoute = ({ component: Component, authenticated, ...rest }) => (
    //if you are authenticated, it redirects back to home. no need to signup or login again
    <Route
        {...rest}
        render={(props) => authenticated === true ? <Redirect to='/'/> : <Component {...props}/>}
    />
)

export default AuthRoute

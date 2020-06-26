import { SET_USER, SET_ERRORS, CLEAR_ERRORS, LOADING_UI, SET_UNAUTHENTICATED, LOADING_USER } from '../types';
import axios from 'axios';

export const loginUser = (userData, history) => (dispatch) => {
    dispatch({ type: LOADING_UI });
    axios
        .post('/login', userData)
        .then(res => {
            //setting token helper function
            setAuthHeader(res.data.token);
            dispatch(getUserData());
            dispatch({ type: CLEAR_ERRORS });
            //redirects to home page
            history.push('/');
        })
        .catch(err => {
            console.log(err.message);
            dispatch({
                type: SET_ERRORS,
                payload: err.response.data
            })
        });
}

export const signupUser = (newUserData, history) => (dispatch) => {
    dispatch({ type: LOADING_UI });
    axios
        .post('/signup', newUserData)
        .then(res => {
            //setting token
            setAuthHeader(res.data.token);
            dispatch(getUserData());
            dispatch({ type: CLEAR_ERRORS });
            //redirects to home page
            history.push('/');
        })
        .catch(err => {
            console.log(err.message);
            dispatch({
                type: SET_ERRORS,
                payload: err.response.data
            })
        });
}

export const logoutUser = () => (dispatch) => {
    //to sign out, remove the token. then no longer have access to logged in functionality
    localStorage.removeItem('FBIdToken');
    delete axios.defaults.headers.common['Authorization'];
    //send the action and the userReducer will set back to initial state where it's blank; not authorized
    dispatch({ type: SET_UNAUTHENTICATED });
}

export const getUserData = () => (dispatch) => {
    dispatch({ type: LOADING_USER });
    axios.get('/user')
        .then(res => {
            dispatch({
                type: SET_USER,
                payload: res.data
            })
        })
        .catch(err => console.log(err));
}

export const uploadImage = (formData) => (dispatch) => {
    dispatch({ type: LOADING_USER });
    //post to this user's image and updates it with new one
    axios.post('/user/image', formData)
        .then(() => {
            dispatch(getUserData());
        })
        .catch(err => console.log(err));
}

export const editUserDetails = (userDetails) => (dispatch) => {
    dispatch({ type: LOADING_USER });
    axios.post('/user', userDetails)
        .then(() => {
            dispatch(getUserData());
        })
        .catch(err => console.log(err));
}

const setAuthHeader = (token) => {
    //store the token in local storage so it isnt lost when page is reloaded
    const FBIdToken = `Bearer ${token}`;
    localStorage.setItem('FBIdToken', FBIdToken);
    //set the auth header w the token
    axios.defaults.headers.common['Authorization'] = FBIdToken;
}
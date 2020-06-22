import { SET_USER, SET_ERRORS, CLEAR_ERRORS, LOADING_UI } from '../types';
import axios from 'axios';

export const loginUser = (userData, history) => (dispatch) => {
    dispatch({ type: LOADING_UI });
    axios
        .post('/login', userData)
        .then(res => {
            //store the token in local storage so it isnt lost when page is reloaded
            const FBIdToken = `Bearer ${res.data.token}`;
            localStorage.setItem('FBIdToken', FBIdToken);
            //set the auth header w the token
            axios.defaults.headers.common['Authorization'] = FBIdToken;
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

export const getUserData = () => (dispatch) => {
    axios.get('/user')
        .then(res => {
            dispatch({
                type: SET_USER,
                payload: res.data
            })
        })
        .catch(err => console.log(err));
}
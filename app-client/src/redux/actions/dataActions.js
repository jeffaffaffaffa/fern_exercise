import { SET_POST, SET_POSTS, LOADING_DATA, LIKE_POST, DISLIKE_POST, DELETE_POST, LOADING_UI, CLEAR_ERRORS, SET_ERRORS, ADD_POST, STOP_LOADING_UI, SUBMIT_COMMENT } from '../types';
import axios from 'axios';

//get all posts
export const getPosts = () => dispatch => {
    dispatch({ type: LOADING_DATA });
    axios.get('/posts')
        .then(res => {
            dispatch({
                type: SET_POSTS,
                payload: res.data
            });
        })
        .catch(err => {
            dispatch({
                type: SET_POSTS,
                payload: []
            });
        });
}

export const getPost = (postId) => dispatch => {
    dispatch({ type: LOADING_UI });
    axios.get(`/posts/${postId}`)
        .then(res => {
            dispatch({ 
                type: SET_POST,
                payload: res.data
            });
            dispatch({ type: STOP_LOADING_UI });
        })
        .catch(err => console.log(err));
}

//create a new post
export const addPost = (newPost) => (dispatch) => {
    dispatch({ type: LOADING_UI });
    axios.post('/post', newPost)
        .then(res => {
            dispatch({
                type: ADD_POST,
                payload: res.data
            });
            dispatch(clearErrors());
        })
        .catch(err => {
            dispatch({
                type: SET_ERRORS,
                payload: err.response.data
            });
        });
}

//like a post
export const likePost = (postId) => dispatch => {
    axios.get(`/posts/${postId}/like`)
        .then(res => {
            //dispatching an action with a payload
            dispatch({
                type: LIKE_POST,
                payload: res.data
            });
        })
        .catch(err => console.log(err));
}

//dislike a post
export const dislikePost = (postId) => dispatch => {
    axios.get(`/posts/${postId}/dislike`)
        .then(res => {
            //dispatching an action with a payload
            dispatch({
                type: DISLIKE_POST,
                payload: res.data
            });
        })
        .catch(err => console.log(err));
}

//submit a comment
export const submitComment = (postId, commentData) => dispatch => {
    axios.post(`/posts/${postId}/comment`, commentData)
        .then(res => {
            dispatch({
                type: SUBMIT_COMMENT,
                payload: res.data
            });
            dispatch(clearErrors());
        })
        .catch(err => {
            dispatch({
                type: SET_ERRORS,
                payload: err.response.data
            });
        });
}

export const deletePost = (postId) => (dispatch) => {
    axios.delete(`/posts/${postId}`)
        .then(() => {
            dispatch({ type: DELETE_POST, payload: postId });
        })
        .catch(err => console.log(err));
}

export const getUserData = (username) => dispatch => {
    dispatch({ type: LOADING_DATA });
    axios.get(`/user/${username}`)
        .then(res => {
            dispatch({
                type: SET_POSTS,
                payload: res.data.posts
            });
        })
        .catch(() => {
            dispatch({
                type: SET_POSTS,
                payload: null
            });
        });
}

//function that only dispatches an action is called an action creator
export const clearErrors = () => dispatch => {
    dispatch({ type: CLEAR_ERRORS });
}

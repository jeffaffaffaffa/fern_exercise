import { SET_POSTS, LOADING_DATA, LIKE_POST, DISLIKE_POST, DELETE_POST } from '../types';
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

export const deletePost = (postId) => (dispatch) => {
    axios.delete(`/posts/${postId}`)
        .then(() => {
            dispatch({ type: DELETE_POST, payload: postId });
        })
        .catch(err => console.log(err));
}

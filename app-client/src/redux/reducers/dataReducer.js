import { SET_POSTS, LIKE_POST, DISLIKE_POST, LOADING_DATA } from '../types';

const initialState = {
    //array that holds all posts
    posts: [],
    post: {},
    loading: false
};

export default function(state = initialState, action) {
    switch(action.type) {
        case LOADING_DATA:
            return {
                ...state,
                loading: true
            }
        case SET_POSTS:
            return {
                ...state,
                posts: action.payload,
                loading: false
            }
        //chain these two cases together; do the same
        case LIKE_POST:
        case DISLIKE_POST:
            //find index of the post that is receiving a like
            let index = state.posts.findIndex((post) => post.postId === action.payload.postId);
            //replace the number of likes w info from payload
            state.posts[index] = action.payload;
            if (state.post.postId === action.payload.postId) {
                state.post = action.payload;
            }
            return {
                ...state
            }
        default:
            return state;
    }
}
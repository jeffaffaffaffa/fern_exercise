import { SET_POST, SET_POSTS, LIKE_POST, DISLIKE_POST, LOADING_DATA, DELETE_POST, ADD_POST } from '../types';

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
            };
        case SET_POSTS:
            return {
                ...state,
                posts: action.payload,
                loading: false
            };
        case SET_POST:
            return {
                ...state,
                post: action.payload
            };
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
            };
        case DELETE_POST:
            //find index of post and remove locally, already removed from db
            index = state.posts.findIndex(post => post.postId === action.payload);
            state.posts.splice(index, 1);
            return {
                ...state
            };
        case ADD_POST:
            return {
                ...state,
                posts: [
                    action.payload,
                    ...state.posts
                ]
            };
        default:
            return state;
    }
}
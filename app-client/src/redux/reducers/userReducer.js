import { SET_USER, SET_ERRORS, CLEAR_ERRORS, LOADING_UI, SET_AUTHENTICATED, SET_UNAUTHENTICATED, LOADING_USER, LIKE_POST, DISLIKE_POST, MARK_NOTIFICATIONS_READ } from '../types';

const initialState = {
    authenticated: false,
    loading: false,
    credentials: {},
    likes: [],
    notifications: []
};

//takes in a state and then an action
export default function(state = initialState, action) {
    switch(action.type) {
        case SET_AUTHENTICATED:
            return {
                //spreads everything in state; its 4 fields
                ...state,
                authenticated: true
            };
        case SET_UNAUTHENTICATED:
            return initialState;
        case SET_USER:
            return {
                authenticated: true,
                ...action.payload
            };
        case LOADING_USER:
            return {
                ...state,
                loading: true
            };
        case LIKE_POST:
            return {
                ...state,
                likes: [
                    ...state.likes,
                    {
                        username: state.credentials.username,
                        postId: action.payload.postId
                    }
                ]
            };
        case DISLIKE_POST:
            return {
                ...state,
                //filters out any like that has the same id as the one in payload; dislike and dont account for it
                likes: state.likes.filter(like => like.postId !== action.payload.postId)
            };
        case MARK_NOTIFICATIONS_READ:
            state.notifications.forEach(notif => notif.read = true);
            return {
                ...state
            };
        default:
            return state;
    }
}
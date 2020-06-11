//get firebase functions
const functions = require('firebase-functions');
//getting express
const app = require('express')();
//get firebase authentication middleware
const FBAuth = require('./util/FBAuth');
//get all handlers for posts and user login/signup
const { getAllPosts, createNewPost } = require('./handlers/posts');
const { userSignup, userLogin, uploadImage } = require('./handlers/users');

//to get the posts from firebase; posts route
//uses express to define the route:
app.get('/posts', getAllPosts);
//creates a new post and adds it to the db
//FBAuth is authentication middleware that intercepts anything that could be bad before it can do smt.
//basically making sure that the user is valid and the token isnt a bad token, or from somewhere else.
app.post('/post', FBAuth, createNewPost);
//signup route
app.post('/signup', userSignup);
//login route
//same validation logic as signup
app.post('/login', userLogin);
//posting an image to server, needs auth so only users can upload
app.post('/user/image', FBAuth, uploadImage);

//good practice to have /api first                                                                   //
//passing in the app to onRequest will automatically have it go to multiple routes, as defined above //
//example route: www.site.com/api/login                                                              //
exports.api = functions.https.onRequest(app);
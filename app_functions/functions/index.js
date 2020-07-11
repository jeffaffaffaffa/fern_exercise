//get firebase functions
const functions = require('firebase-functions');
//getting express
const app = require('express')();
//get firebase authentication middleware
const FBAuth = require('./util/FBAuth');
//get all handlers for posts and user login/signup
const { getAllPosts, createNewPost, getPost, commentOnPost, likePost, dislikePost, deletePost } = require('./handlers/posts');
const { userSignup, userLogin, uploadImage, addUserDetails, getAuthenticatedUserDetails, getUserDetails, markNotificationsRead } = require('./handlers/users');

const cors = require('cors');
app.use(cors());

const { db } = require('./util/admin');

//** POST ROUTES **//
//to get the posts from firebase; posts route
//uses express to define the route:
app.get('/posts', getAllPosts);
//creates a new post and adds it to the db
//FBAuth is authentication middleware that intercepts anything that could be bad before it can do smt.
//basically making sure that the user is valid and the token isnt a bad token, or from somewhere else.
app.post('/post', FBAuth, createNewPost);
// allow users to view a particular post, not protected so any user can see it.
app.get('/posts/:postId', getPost);
// route to delete a post; must be authorized
app.delete('/posts/:postId', FBAuth, deletePost);
// route to like a post; must be authorized
app.get('/posts/:postId/like', FBAuth, likePost);
// route to disklike a post; must be authorized
app.get('/posts/:postId/dislike', FBAuth, dislikePost);
// creating a comment, only authorized users can comment
app.post('/posts/:postId/comment', FBAuth, commentOnPost);
// TODO: create edit post route


//** USER ROUTES **//
//signup route
app.post('/signup', userSignup);
//login route
//same validation logic as signup
app.post('/login', userLogin);
//posting an image to server, needs auth so only users can upload
app.post('/user/image', FBAuth, uploadImage);
//adding user details
app.post('/user', FBAuth, addUserDetails);
//get details pertaining to stuff user has liked, interacted with, etc.
app.get('/user', FBAuth, getAuthenticatedUserDetails);
//get details of a particular user (public)
app.get('/user/:username', getUserDetails);
//remove notification after it is read; mark it as read
app.post('/notifications', FBAuth, markNotificationsRead);


//good practice to have /api first                                                                   //
//passing in the app to onRequest will automatically have it go to multiple routes, as defined above //
//example route: www.site.com/api/login                                                              //
exports.api = functions.https.onRequest(app);

//THIS SECTION CONTAINS THE DB TRIGGERS                                                 //
//THINGS THAT HAPPEN WHEN SOMETHING HAPPENS, LIKE AN EVENT LISTENER                    //
//can remove things on firebase console and see it happen, no need to send a request  //

//create a notification when a post gets a like
//region of current region
exports.createNotificationOnLike = functions.region('us-central1').firestore.document('likes/{id}')
    .onCreate(snapshot => {
        //the like (snapshot) is tied to a post, get that post id and then if the post exists,
        // return a notifcation object with 6 fields.
        return db.doc(`/posts/${snapshot.data().postId}`).get()
            .then(doc => {
                if (doc.exists && doc.data().username !== snapshot.data().username) {
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().username,
                        sender: snapshot.data().username,
                        type: 'like',
                        read: false,
                        postId: doc.id
                    });
                }
            })
            .catch(err => {
                console.error(err);
                //no response needed bc it is a database trigger
            });
    });

//identical to create notif on like except changing type to comment
exports.createNotificationOnComment = functions.region('us-central1').firestore.document('comments/{id}')
    .onCreate(snapshot => {
        return db.doc(`/posts/${snapshot.data().postId}`).get()
            .then(doc => {
                //check if post exists and if the owner of the post is the commenter, no notif. same logic for on like
                if (doc.exists && doc.data().username !== snapshot.data().username) {
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().username,
                        sender: snapshot.data().username,
                        type: 'comment',
                        read: false,
                        postId: doc.id
                    });
                }
            })
            .catch(err => {
                console.error(err);
                //no response needed bc it is a database trigger
                return;
            });
    });

//delete a notification if a like is removed
//uses onDelete
exports.deleteNotificationOnDislike = functions.region('us-central1').firestore.document('likes/{id}')
    .onDelete(snapshot => {
        //like and notification have the same id
        return db.doc(`/notifications/${snapshot.id}`)
            .delete()
            .catch(err => {
                console.error(err);
                return;
            });
    });

//if user changes profile picture, updates the picture on all of their posts
// note: this trigger will happen if anything is changed in user's info.
exports.onUserImageChange = functions.region('us-central1').firestore.document('/users/{userId}')
    .onUpdate(change => {
        //can compare the before and after pictures to see what changed
        console.log(change.before.data());
        console.log(change.after.data());
        //only need to do it if the image has changed
        if (change.before.data().imageUrl !== change.after.data().imageUrl) {
            console.log('image has changed');
            //batch to get all
            const batch = db.batch();
            //return all posts that are the user's
            return db.collection('posts')
                .where('username', '==', change.before.data().username).get()
                .then(data => {
                    //then for each post, update the imageUrl value
                    data.forEach(doc => {
                        const post = db.doc(`/posts/${doc.id}`);
                        batch.update(post, { imageUrl: change.after.data().imageUrl });
                    })
                    return batch.commit();
                });
        } else return true;
    })

//when a post is deleted, also delete all comments, likes, and notifications linked to the post
exports.onPostDelete = functions.region('us-central1').firestore.document('/posts/{postId}')
    .onDelete((snapshot, context) => {
        const postId = context.params.postId;
        const batch = db.batch();
        return db.collection('comments').where('postId', '==', postId).get()
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/comments/${doc.id}`));
                })
                return db.collection('likes').where('postId', '==', postId).get();
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/likes/${doc.id}`));
                })
                return db.collection('notifications').where('postId', '==', postId).get();
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/notifications/${doc.id}`));
                })
                return batch.commit();
            })
            .catch(err => {
                console.error(err)
            });
    })
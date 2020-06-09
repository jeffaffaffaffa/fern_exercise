const functions = require('firebase-functions');
//for admin access to database
const admin = require('firebase-admin');

admin.initializeApp();

//getting express
const express = require('express');
const app = express();

//to get the posts from firebase, need to have admin access.
//admin.firestore() is the database.
//.collection('posts').get() retrieves the documents in the posts collection of the db.
//uses express to define the route:
app.get('/posts', (req, res) => {
    admin
    .firestore()
    .collection('posts')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
        let posts = [];
        //for each doc in the data, push it into the posts array.
        //doc is a reference, need to call .data() to return the thing it is referring to.
        data.forEach(doc => {
            posts.push({
                postId: doc.id,
                body: doc.data().body,
                username: doc.data().username,
                createdAt: doc.data().createdAt
            });
        });
        //return the list of posts as the response, in json format
        return res.json(posts);
    })
    .catch(err => {
        res.status(404).json({ error: '404 error: items not found.' });
        console.error(err);
    });
});

//creates a new post and adds it to the db
app.post('/post', (req, res) => {    
    const newPost = {
        body: req.body.body, //the body of the new post comes from the request body, with a body property (from db)
        username: req.body.username,
        createdAt: new Date().toISOString() //uses JS Date object to create new date
    };

    //add the new post to the posts collection, with proper responses
    admin.firestore()
        .collection('posts')
        .add(newPost)
        .then(doc => {
            res.json({ message: `document ${doc.id} created successfully!` });
        })
        .catch(err => {
            res.status(500).json({ error: '500 error: server issue.' });
            console.error(err);
        });
    });

//good practice to have /api first
//passing in the app to onRequest will automatically have it go to multiple routes
exports.api = functions.https.onRequest(app);
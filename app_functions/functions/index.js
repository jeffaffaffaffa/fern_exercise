const functions = require('firebase-functions');
//for admin access to database
const admin = require('firebase-admin');
//getting express
const app = require('express')();

admin.initializeApp();

//firebase configuration
const config = {
    apiKey: "AIzaSyCSe9DRkahQOBZ9xdJzu2d_HvSXDhUR4_Q",
    authDomain: "react-firebase-exercise-a96db.firebaseapp.com",
    databaseURL: "https://react-firebase-exercise-a96db.firebaseio.com",
    projectId: "react-firebase-exercise-a96db",
    storageBucket: "react-firebase-exercise-a96db.appspot.com",
    messagingSenderId: "951526671311",
    appId: "1:951526671311:web:a9dd3e1e38ea56d4d008ba",
    measurementId: "G-SC5V0CC62S"
};

//initialize firebase in app using config info
const firebase = require('firebase');
firebase.initializeApp(config);

//the database itself, with admin access
const db = admin.firestore();

//to get the posts from firebase, need to have admin access.
//admin.firestore() is the database.
//.collection('posts').get() retrieves the documents in the posts collection of the db.
//uses express to define the route:
app.get('/posts', (req, res) => {
    db.collection('posts')
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

//middleware authentication function that makes sure the token is coming from a valid user
const FBAuth = (req, res, next) => {
    let userToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        //split based on 'Bearer '
        //results in an array of two things, second thing is the token
        userToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        console.error('No token found!');
        return res.status(403).json({ error: 'Unauthorized!' });
    }
    //verify the token
    admin.auth().verifyIdToken(userToken)
        .then(decodedToken => {
            //want to pass this info along; decoded token is the user info
            req.user = decodedToken;
            console.log(decodedToken);
            //find where the userId matches request id in the db
            return db.collection('users')
                .where('userId', '==', req.user.uid)
                .limit(1)
                .get();
        })
        .then(data => {
            //the username is in the first thing in the data.docs array, since we limited to one.
            req.user.username = data.docs[0].data().username;
            //returning next() allows the function to proceed; middleware is finished
            return next();
        })
        .catch(err => {
            //else error handling
            console.error('Error while verifiying token ', err);
            return res.status(403).json(err);
        })
}

//creates a new post and adds it to the db
//FBAuth is authentication middleware that intercepts anything that could be bad before it can do.
//    basically making sure that the user is valid and the token isnt a bad token, or from somewhere else.
//anything with the request and response.
app.post('/post', FBAuth, (req, res) => {    
    const newPost = {
        body: req.body.body, //the body of the new post comes from the request body, with a body property (from db)
        username: req.user.username, //this is coming from the response from the middleware and is requested here.
        createdAt: new Date().toISOString() //uses JS Date object to create new date
    };

    //add the new post to the posts collection, with proper responses
    db.collection('posts')
        .add(newPost)
        .then(doc => {
            res.json({ message: `document ${doc.id} created successfully!` });
        })
        .catch(err => {
            res.status(500).json({ error: '500 error: server issue.' });
            console.error(err);
        });
    });

//HELPER METHODS//
//
//validate/check for empty fields
const isEmpty = (string) => {
    //trim eliminates whitespaces
    if (string.trim() === '') return true;
    else return false;
}
//check if the email is an email using regular expression
const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regEx)) return true;
    else return false;
}
//END OF HELPER METHODS//

//signup route
let userToken, userId;
app.post('/signup', (req, res) => {
    //create new user using info from req body
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        username: req.body.username
    };

    // using validation helper methods    //
    // to make sure all information being //
    // received from client side is valid //
    
    //create an errors object
    let errors = {};

    if (isEmpty(newUser.email)) {
        errors.email = 'Must not be empty!'
    } else if (!isEmail(newUser.email)) {
        errors.email = 'Must be a valid email address!';
    }

    if (isEmpty(newUser.password)) errors.password = 'Must not be empty!';
    if (newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords must match!';
    if (isEmpty(newUser.username)) errors.username = 'Must not be empty!';

    //if the errors object has stuff in it, break here and do not run anything after!
    //client side error; invalid inputs!
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    //check if new username is taken or not
    //get returns a promise to be used in then as "doc"
    db.doc(`/users/${newUser.username}`).get()
        .then(doc => {
            //if this username already exists, we have a problem
            if (doc.exists) {
                //bad request: 400
                //errors pertaining to certain thing will be named accordingly; username in this case.
                return res.status(400).json({ username: 'This username is already taken!'});
            } else {
                //create the user
                return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
            }
        })
        .then(data => {
            //if we get here, the user has been created; set userId
            userId = data.user.uid;
            //need auth token for the user to later use to req more data
            return data.user.getIdToken();
        })
        .then(token => {
            userToken = token;
            const userCredentials = {
                username: newUser.username,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId: userId
            };
            //return a promise; set the new user using user creds
            return db.doc(`/users/${newUser.username}`).set(userCredentials);
        })
        .then(() => {
            //created successfully, send the token in res
            return res.status(201).json({ token: userToken });
        })
        .catch(err => {
            //if error, response is error code
            console.error(err);
            //if the error code is this, it is a client side error, nothing wrong with server.
            if (err.code === 'auth/email-already-in-use') {
                return res.status(400).json({ email: 'Email is already in use!' })
            } else {
                return res.status(500).json({ error: err.code });
            }
        });
});

//login route
//same validation logic as signup
app.post('/login', (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    let errors = {}
    if (isEmpty(user.email)) errors.email = 'Must not be empty!';
    if (isEmpty(user.password)) errors.password = 'Must not be empty!';
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    //if no errors, can go ahead and login to firebase so user can access their things
    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            //get token
            return data.user.getIdToken();
        })
        .then(token => {
            //send the token
            return res.json({ token });
        })
        .catch(err => {
            //if any errors
            console.error(err);

            if (err.code === 'auth/wrong-password') {
                //403 means unauthorized
                return res.status(403).json({ general: 'Wrong credentials, please try again!' });
            } else {
                return res.status(500).json({ error: err.code });
            }
    
        });
});

//good practice to have /api first                                                                   //
//passing in the app to onRequest will automatically have it go to multiple routes, as defined above //
//example route: www.site.com/api/login                                                              //

exports.api = functions.https.onRequest(app);
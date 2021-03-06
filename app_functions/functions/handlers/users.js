const { admin, db } = require('../util/admin');

const config = require('../util/config');

//initializing firebase
const firebase = require('firebase');
firebase.initializeApp(config);

const { validateSignupData, validateLoginData, reduceUserDetails } = require('../util/validators');

//user signup function export
exports.userSignup = (req, res) => {
    //create new user using info from req body
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        username: req.body.username
    };

    //get whether or not signup data is valid and the subsequent errors from validation utility function
    const { valid, errors } = validateSignupData(newUser);
    //if it is not valid, change status and pass the errors.
    if (!valid) return res.status(400).json(errors);

    const noImage = 'no-image.jpg';

    //check if new username is taken or not; VALIDATION
    //get returns a promise to be used in then as "doc"
    let userToken, userId;
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
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImage}?alt=media`,
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
                return res.status(500).json({ general: 'Something went wrong, please try again!' });
            }
        });
}

//user login function export
exports.userLogin = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    //get whether or not login data is valid and the subsequent errors from validation utility function
    const { valid, errors } = validateLoginData(user);
    //if it is not valid, change status and pass the errors.
    if (!valid) return res.status(400).json(errors);

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
            //403 means unauthorized
            return res.status(403).json({ general: 'Wrong credentials, please try again!' });
        });
}

//add user details 
exports.addUserDetails = (req, res) => {
    let userDetails = reduceUserDetails(req.body);
    //updates info or adds info keys w info
    db.doc(`/users/${req.user.username}`).update(userDetails)
        .then(() => {
            return res.json({ message: 'Profile details added successfully!' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
}

//get a particular user's details
exports.getUserDetails = (req, res) => {
    let userData = {};
    db.doc(`/users/${req.params.username}`).get()
        .then(doc => {
            //check if user exists
            if (doc.exists) {
                userData.user = doc.data();
                //get all user's posts
                return db.collection('posts').where('username', '==', req.params.username)
                    .orderBy('createdAt', 'desc')
                    .get();
            } else {
                return res.status(404).json({ error: 'User not found!' });
            }
        })
        .then(data => {
            userData.posts = [];
            data.forEach(doc => {
                userData.posts.push({
                    body: doc.data().body,
                    createdAt: doc.data().createdAt,
                    username: doc.data().username,
                    imageUrl: doc.data().imageUrl,
                    numLikes: doc.data().numLikes,
                    numComments: doc.data().numComments,
                    postId: doc.id
                });
            });
            return res.json(userData);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
}

//get your own user details (liked posts, etc.)
exports.getAuthenticatedUserDetails = (req, res) => {
    let userData = {};
    db.doc(`/users/${req.user.username}`).get()
        .then(doc => {
            if (doc.exists) {
                userData.credentials = doc.data();
                return db.collection('likes').where('username', '==', req.user.username).get();
            }
        })
        .then(data => {
            userData.likes = [];
            data.forEach(doc => {
                userData.likes.push(doc.data());
            });
            return db.collection('notifications').where('recipient', '==', req.user.username)
                .orderBy('createdAt', 'desc').limit(10).get();
        })
        .then(data => {
            userData.notifications = [];
            data.forEach(doc => {
                userData.notifications.push({
                    recipient: doc.data().recipient,
                    sender: doc.data().sender,
                    createdAt: doc.data().createdAt,
                    postId: doc.data().postId,
                    type: doc.data().type,
                    read: doc.data().read,
                    notificationId: doc.id
                });
            });
            return res.json(userData);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
}

//uploading image to my firebase storage stuff
exports.uploadImage = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    //pass in our req headers
    const busboy = new BusBoy({ headers: req.headers });

    let imageFileName;
    let imageToBeUploaded = {};

    //file listener
    //fb storage rules: changed to just allow read
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        //can only submit jpg or png images for profile image
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.status(400).json({ error: 'Must upload jpg or png file!' });
        }

        console.log(fieldname);
        console.log(filename);
        console.log(mimetype);
        // image.png, need to get the ".png" extension
        // split string by dots and get the last thing
        // split returns an array
        const imageExtension = filename.split('.')[filename.split('.').length - 1];
        //make an example filename: 93894294923.png
        imageFileName = `${Math.round(Math.random() * 1000000000)}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = { filepath, mimetype };
        //this creates the file
        file.pipe(fs.createWriteStream(filepath));
    });
    busboy.on('finish', () => {
        //might not need "config.storageBucket"
        admin.storage().bucket(config.storageBucket).upload(imageToBeUploaded.filepath, {
            resumable: false,
            metadata: {
                metadata: {
                    contentType: imageToBeUploaded.mimetype
                }
            }
        })
        .then(() => {
            //need alt=media so it doesnt download to computer; displays in browser
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
            //updates the image url in the db for this particular user with the new url
            return db.doc(`/users/${req.user.username}`).update({ imageUrl });
        })
        .then(() => {
            return res.json({ message: 'Image uploaded successfully!' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
    });
    busboy.end(req.rawBody);
}

//marking notifications as read after user has seen them
exports.markNotificationsRead = (req, res) => {
    //batch lets you update a bunch of things at once
    let batch = db.batch();
    req.body.forEach(notificationId => {
        const notification = db.doc(`/notifications/${notificationId}`)
        //takes doc reference and what we want to update
        batch.update(notification, { read: true });
    });
    batch.commit()
        .then(() => {
            return res.json({ message: 'Notifications marked as read!' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
}
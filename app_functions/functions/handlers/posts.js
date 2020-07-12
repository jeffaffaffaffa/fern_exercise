const { db } = require('../util/admin');
//to get the posts from firebase, need to have admin access.
//admin.firestore() is the database.
//.collection('posts').get() retrieves the documents in the posts collection of the db.
//uses express to define the route:
exports.getAllPosts = (req, res) => {
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
                createdAt: doc.data().createdAt,
                imageUrl: doc.data().imageUrl,
                numLikes: doc.data().numLikes,
                numComments: doc.data().numComments
            });
        });
        //return the list of posts as the response, in json format
        return res.json(posts);
    })
    .catch(err => {
        res.status(404).json({ error: '404 error: items not found.' });
        console.error(err);
    });
}

//creates a new post and adds it to the db
exports.createNewPost = (req, res) => {
    if (req.body.body.trim() === '') {
        return res.status(400).json({ body: 'Body must not be empty!' });
    }
        
    const newPost = {
        body: req.body.body, //the body of the new post comes from the request body, with a body property (from db)
        username: req.user.username, //this is coming from the response from the middleware and is requested here.
        imageUrl: req.user.imageUrl, //user profile pic
        createdAt: new Date().toISOString(), //uses JS Date object to create new date
        numLikes: 0, //keep track of number of likes, initialized to 0
        numComments: 0 //keep track of number of comments, initialized to 0
    };

    //add the new post to the posts collection, with proper responses
    db.collection('posts')
        .add(newPost)
        .then(doc => {
            const resPost = newPost;
            resPost.postId = doc.id; //can edit a key in const, just can't change the data type or complete value of object
            res.json(resPost);
        })
        .catch(err => {
            res.status(500).json({ error: '500 error: server issue.' });
            console.error(err);
        });
}

    //getting a particular post
exports.getPost = (req, res) => {
    let postData = {};
    //find the post from request
    db.doc(`/posts/${req.params.postId}`).get()
        .then(doc => {
            //checks if the post id exists
            if (!doc.exists) {
                // 404 is not found error
                return res.status(404).json({ error: 'Post not found!' });
            }
            //add the doc data to the post data; it is the data we want
            postData = doc.data();
            // the doc id is our post id
            postData.postId = doc.id;
            //then returns the comments that have that post id, ordered by descending order
            return db.collection('comments').orderBy('createdAt', 'desc').where('postId', '==', req.params.postId).get();
            //returns these comments; is a promise
        })
        .then(data => {
            //for each comment in data that is passed along from previous then
            postData.comments = [];
            data.forEach(doc => {
                //push each doc comment to the post data comments array 
                postData.comments.push(doc.data());
            });
            return res.json(postData);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
}

// add comment on a post
exports.commentOnPost = (req, res) => {
    if (req.body.body.trim() === '') return res.status(400).json({ comment: 'Must not be empty!' });
    const newComment = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        postId: req.params.postId,
        username: req.user.username,
        imageUrl: req.user.imageUrl //user's image
    };

    //check that post exists
    db.doc(`/posts/${req.params.postId}`).get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'Post not found!' });
            }
            //updates the number of comments
            return doc.ref.update({ numComments: doc.data().numComments + 1 });
        })
        .then(() => {
            //.add() adds a document, pass in data as json format
            return db.collection('comments').add(newComment);
        })
        .then(() => {
            res.json(newComment);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong!' });
        });
}

//liking a post
exports.likePost = (req, res) => {
    //need to check if the doc in question already exists aka the user has already liked the post
    //also need to check if the post exists
    const likeDocument = db.collection('likes').where('username', '==', req.user.username)
        .where('postId', '==', req.params.postId).limit(1); //find the post the user is liking

    //the post in question
    const postDocument = db.doc(`/posts/${req.params.postId}`);

    let postData;

    postDocument.get()
        .then(doc => {
            //make sure the post exists
            if (doc.exists) {
                postData = doc.data();
                postData.postId = doc.id;
                return likeDocument.get();
            } else {
                return res.status(404).json({ error: 'Post not found!' });
            }
        })
        .then(data => {
            //if the data is not empty, we can't create it. post has already been liked
            if (data.empty) {
                return db.collection('likes').add({
                    postId: req.params.postId,
                    username: req.user.username
                })
                .then(() => {
                    postData.numLikes++; //increment like count by one
                    return postDocument.update({ numLikes: postData.numLikes });
                })
                .then(() => {
                    //need to also send comments back as page is rerendered; otherwise comments array is undefined
                    return db.collection('comments').orderBy('createdAt', 'desc').where('postId', '==', req.params.postId).get();
                })
                .then((comments) => {
                    postData.comments = [];
                    comments.forEach((doc) => {
                        postData.comments.push(doc.data());
                    });
                    return res.json(postData);
                });
            } else {
                //we have a like, cannot like bc already liked
                return res.status(400).json({ error: 'Post already liked!' });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
}

//disliking a post
exports.dislikePost = (req, res) => {
    //need to check if the doc in question already exists aka the user has already disliked the post
    //also need to check if the post exists
    const likeDocument = db.collection('likes').where('username', '==', req.user.username)
        .where('postId', '==', req.params.postId).limit(1); //find the post the user is disliking

    //the post in question
    const postDocument = db.doc(`/posts/${req.params.postId}`);

    let postData;

    postDocument.get()
        .then(doc => {
            //make sure the post exists
            if (doc.exists) {
                postData = doc.data();
                postData.postId = doc.id;
                return likeDocument.get();
            } else {
                return res.status(404).json({ error: 'Post not found!' });
            }
        })
        .then(data => {
            //if the data is not empty, we can't create it. post has already been disliked
            if (data.empty) {
                return res.status(400).json({ error: 'Post already disliked!' });
            } else {
                //we have a dislike, cannot like bc already disliked
                return db.doc(`/likes/${data.docs[0].id}`).delete()
                    .then(() => {
                        postData.numLikes--;
                        return postDocument.update({ numLikes: postData.numLikes });
                    })
                    .then(() => {
                        return db.collection('comments').orderBy('createdAt', 'desc').where('postId', '==', req.params.postId).get();
                    })
                    .then((comments) => {
                        postData.comments = [];
                        comments.forEach((doc) => {
                            postData.comments.push(doc.data());
                        });
                        return res.json(postData);
                    });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
}

//deleting a post
exports.deletePost = (req, res) => {
    //this is the post aka doc we want to delete
    const document = db.doc(`/posts/${req.params.postId}`);
    document.get()
        .then(doc => {
            //before deletion, check if it exists
            if (!doc.exists) {
                return res.status(404).json({ error: 'Post does not exist or has already been deleted!' });
            }
            //then, need to check that the user is the creator of the post. 
            //only post authors can delete posts.
            if (doc.data().username !== req.user.username) {
                return res.status(403).json({ error: 'Unauthorized!' });
            } else {
                //deletes doc
                return document.delete();
            }
        })
        .then(() => {
            res.json({ message: 'Post deleted successfully!' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
}

// TODO: create edit post route
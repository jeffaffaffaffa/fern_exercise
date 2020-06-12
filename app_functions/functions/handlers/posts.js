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
}

//creates a new post and adds it to the db
exports.createNewPost = (req, res) => {
    if (req.body.body.trim() === '') {
        return res.status(400).json({ body: 'Body must not be empty!' });
    }
        
    const newPost = {
        body: req.body.body, //the body of the new post comes from the request body, with a body property (from db)
        username: req.user.username, //this is coming from the response from the middleware and is requested here.
        //imageUrl: req.user.imageUrl,
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
        if (req.body.body.trim() === '') return res.status(400).json({ error: 'Must not be empty!' });
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
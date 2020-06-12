const { admin, db } = require('./admin');

//middleware authentication function that makes sure the token is coming from a valid user
module.exports = (req, res, next) => {
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
            //console.log(decodedToken);
            //find where the userId matches request id in the db
            return db.collection('users')
                .where('userId', '==', req.user.uid)
                .limit(1)
                .get();
        })
        .then(data => {
            //the username is in the first thing in the data.docs array, since we limited to one.
            req.user.username = data.docs[0].data().username;
            //add user image as well
            req.user.imageUrl = data.docs[0].data().imageUrl;
            //returning next() allows the function to proceed; middleware is finished
            return next();
        })
        .catch(err => {
            //else error handling
            console.error('Error while verifiying token ', err);
            return res.status(403).json(err);
        });
}
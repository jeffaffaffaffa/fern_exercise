//AKA CONNECTING TO DATABASE FILE

//for admin access to database
const admin = require('firebase-admin');
admin.initializeApp();
//the database itself, with admin access
const db = admin.firestore();

module.exports = { admin, db };
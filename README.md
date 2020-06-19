# FERN Exercise (Firebase, Express, React, Node)
- Following a Firebase and React tutorial on YouTube to learn how to create a social media app.
- Video link: https://www.youtube.com/watch?v=m_u6P5k0vP0&t=635s&fbclid=IwAR2fVS8vn0cfoZGhCUPGlDygJUBLpIClMhXv2e7h-ECued13VmOb-bs5K7M
- Progress: currently at 4:23:25.

# Things to note:
- Extra npm packages used: busboy (for image uploads).
- In the database rules on the Firebase console, line 5 is changed to "allow read, write if false;"
    - This locks out everyone who might try to access the database who is NOT using my defined routes.
    -  This is because Firebase has a built-in REST API: https://firebase.google.com/docs/firestore/use-rest-api
        - The URL: https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default)/documents/one_of_my_routes can read and write to the database if the rules had not been updated.

Updated: 06.18.2020 19:40:56

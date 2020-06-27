# FERN Exercise (Firebase, Express, React - Redux, Node)
- Following a Firebase and React tutorial on YouTube to learn how to create a social media app.
- Video link: https://www.youtube.com/watch?v=m_u6P5k0vP0&t=635s&fbclid=IwAR2fVS8vn0cfoZGhCUPGlDygJUBLpIClMhXv2e7h-ECued13VmOb-bs5K7M
- Progress: currently at 8:39:01.

- Redux rundown: https://www.youtube.com/watch?v=CVpUuw9XSjY

# Things to note:
- Extra npm packages used: busboy (for image uploads).
- In the database rules on the Firebase console, line 5 is changed to "allow read, write if false;"
    - This locks out everyone who might try to access the database who is NOT using my defined routes.
    -  This is because Firebase has a built-in REST API: https://firebase.google.com/docs/firestore/use-rest-api
        - The URL: https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default)/documents/one_of_my_routes can read and write to the database if the rules had not been updated.

- 'create-react-app directory_name' creates react app in specified location.
- after making components and pages folders and minor formatting:
    - npm install --save react-router-dom
- using material ui: 
    - https://material-ui.com
    - npm install --save @material-ui/core
- starting react app: npm start in directory
- npm install --save axios
- end of package.json file:
    - "proxy": "https://us-central1-react-firebase-exercise-a96db.cloudfunctions.net/api"
- npm install --save dayjs
- npm install --save jwt-decode (json web tokens)
- npm install --save redux react-redux redux-thunk (setting up redux)
- npm install --save @material-ui/icons (for icons)

Updated: 06.26.2020

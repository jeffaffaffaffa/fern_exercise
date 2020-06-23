export default {
    palette: {
        primary: {
        light: '#33c9dc',
        main: '#00bcd4',
        dark: '#008394',
        contrastText: '#fff'
        },
        secondary: {
        light: '#ff6333',
        main: '#ff3d00',
        dark: '#b22a00',
        contrastText: '#fff'
        }
    },
    //need to wrap everything as its own obj, weird error if not
    spreadThis: {
        typography: {
        useNextVariants: true
        },
        form: {
        textAlign: 'center'
        },
        image: {
            margin: '20px auto 20px auto'
        },
        pageTitle: {
            margin: '10px auto 10px auto'
        },
        textField: {
            margin: '10px auto 10px auto'
        },
        button: {
            marginTop: 20,
            marginBottom: 20,
            position: 'relative'
        },
        customError: {
            color: 'red',
            fontSize: '0.8rem',
            marginTop: 10
        },
        progress: {
            //button is relative, absolute puts the spinner in the middle of the button
            postiion: 'absolute'
        }
    }
};
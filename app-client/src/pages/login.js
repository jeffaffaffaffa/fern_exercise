import React, { Component } from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';
import AppIcon from '../images/icon.png';
import axios from 'axios';

//MUI
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';

//redux
import { connect } from 'react-redux';
import { loginUser } from '../redux/actions/userActions';

const style = (theme) => ({
    //from theme in app
    ...theme.spreadThis
});

class login extends Component {
    constructor() {
        super();
        this.state = {
            email: '',
            password: '',
            errors: {}
        }
    }

    componentWillReceiveProps(nextProps) {
        //meed tp set the login errors only if there are errors, otherwise its undefined
        if (nextProps.UI.errors) {
            this.setState({ errors: nextProps.UI.errors });
        }
    }

    handleSubmit = (event) => {
        // console.log("handle submit");
        event.preventDefault();
        const userData = {
            email: this.state.email,
            password: this.state.password
        };
        //pass in user data and the history so we can redirect on success
        this.props.loginUser(userData, this.props.history);
    }

    //written generically, works for both email and pass
    handleChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    render() {
        const { 
            classes, 
            UI: { loading } 
        } = this.props;
        const { errors } = this.state;
        return (
            <Grid container className={classes.form}>
                <Grid item sm/>
                <Grid item sm>
                    <img src={AppIcon} alt="duck" className={classes.image}/>
                    <Typography variant="h2" className={classes.pageTitle}>
                        Login
                    </Typography>
                    <form noValidate onSubmit={this.handleSubmit}>
                        <TextField 
                            id="email" 
                            name="email" 
                            type="email" 
                            label="Email" 
                            className={classes.textField} 
                            helperText={errors.email} 
                            error={errors.email ? true: false}
                            value={this.state.email} 
                            onChange={this.handleChange} 
                            fullWidth />
                        <TextField 
                            id="password" 
                            name="password" 
                            type="password" 
                            label="Password" 
                            className={classes.textField} 
                            helperText={errors.password} 
                            error={errors.password ? true: false}
                            value={this.state.password} 
                            onChange={this.handleChange} 
                            fullWidth />

                        {errors.general && (
                            <Typography variant="body1" className={classes.customError}>
                                {errors.general}
                            </Typography>
                        )}
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary" 
                            className={classes.button}
                            disabled={loading}
                            >
                                Login
                                {loading && (
                                    <CircularProgress size={30} className={classes.progress} />
                                )}
                        </Button>
                        <br />
                        <small>Don't have an account? Sign up <Link to="/signup">here</Link>!</small>
                    </form>
                </Grid>
                <Grid item sm/>
            </Grid>
        )
    }
}

login.propTypes = {
    classes: PropTypes.object.isRequired,
    loginUser: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    UI: PropTypes.object.isRequired
};

//user and UI brought in from global state and mapped to our component props, so we can use above as this.props.loginUser
const mapStateToProps = (state) => ({
    user: state.user,
    UI: state.UI
});

const mapActionsToProps = {
    loginUser
}

export default connect(mapStateToProps, mapActionsToProps)(withStyles(style)(login))

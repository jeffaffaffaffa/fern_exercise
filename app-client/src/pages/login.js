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
            loading: false,
            errors: {}
        }
    }

    handleSubmit = (event) => {
        // console.log("handle submit");
        event.preventDefault();
        this.setState({
            loading: true
        });

        const userData = {
            email: this.state.email,
            password: this.state.password
        }

        axios.post('/login', userData)
            .then(res => {
                console.log(res.data);
                //store the token in local storage so it isnt lost when page is reloaded
                localStorage.setItem('FBIdToken', `Bearer ${res.data.token}`);
                this.setState({
                    loading: false
                });
                //redirects to home page
                this.props.history.push('/');
            })
            .catch(err => {
                console.log(err.message);
                this.setState({
                    errors: err.response.data,
                    loading: false
                })
            });
    }

    //written generically, works for both email and pass
    handleChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    render() {
        const {classes} = this.props;
        const { errors, loading } = this.state;
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
    classes: PropTypes.object.isRequired
}

export default withStyles(style)(login);

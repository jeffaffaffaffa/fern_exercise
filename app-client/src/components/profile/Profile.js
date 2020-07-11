import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import EditDetails from './EditDetails';
import MyButton from '../../util/MyButton';
import ProfileSkeleton from '../../util/ProfileSkeleton';

//MUI stuff
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

//icons
import LocationOn from '@material-ui/icons/LocationOn';
import LinkIcon from '@material-ui/icons/Link';
import CalendarToday from '@material-ui/icons/CalendarToday';
import KeyboardReturn from '@material-ui/icons/KeyboardReturn';
import EditIcon from '@material-ui/icons/Edit';

//redux
import { connect } from 'react-redux';
import { logoutUser, uploadImage } from '../../redux/actions/userActions';

const style = (theme) => ({
  ...theme.spreadThis
});

class Profile extends Component {

    handleImageChange = (event) => {
        // it is an array, the first one
        const image = event.target.files[0];
        // send to server
        const formData = new FormData();
        formData.append('image', image, image.name);
        this.props.uploadImage(formData);
    };

    handleEditPicture = () => {
        //since we are hiding the file upload thing, can have it done from behind the scence with click()
        const fileInput = document.getElementById('imageInput');
        fileInput.click();
    };

    handleLogout = () => {
      this.props.logoutUser();
    }

    render() {
        const { classes, user: { credentials: { username, createdAt, imageUrl, bio, website, location }, loading, authenticated } } = this.props;
        //profile depends on if it is loading and if user is authenticated aka logged in
        let profileMarkup = !loading ? (authenticated ? (
            <Paper className={classes.paper}>
                <div className={classes.profile}>
                    <div className="image-wrapper">
                        <img src={imageUrl} alt="profile_img" className="profile-image"/>
                        <input type="file" id="imageInput" onChange={this.handleImageChange} hidden="hidden"/>
                        
                        <MyButton tip="Edit profile picture" onClick={this.handleEditPicture} btnClassname="button">
                            <EditIcon color="primary"/>
                        </MyButton>
                    </div>
                    <hr/>
                    <div className="profile-details">
                        <MuiLink component={Link} to={`/users/${username}`} color="primary" variant="h5">
                            @{username}
                        </MuiLink>
                        <hr/>
                        {bio && <Typography variant="body2">{bio}</Typography>}
                        <hr/>
                        {/* display things only if they exist */}
                        {location && (
                            // fragments dont render anything, just tell react that it is all in one element
                            <Fragment> 
                                <LocationOn color="primary"/> <span>{location}</span>
                                <hr/>
                            </Fragment>
                        )}
                        {website && (
                            <Fragment>
                                <LinkIcon color="primary"/>
                                <a href={website} target="_blank" rel="noopener noreferrer">
                                    {' '}{website}
                                </a>
                                <hr/>
                            </Fragment>
                        )}
                        <CalendarToday color="primary"/>{' '}
                        <span>Joined {dayjs(createdAt).format('MMM YYYY')}</span>
                    </div>

                    <MyButton tip="Logout" onClick={this.handleLogout}>
                        <KeyboardReturn color="primary"/>
                    </MyButton>

                    <EditDetails/>
                </div>
            </Paper>
        ) : (
            <Paper className={classes.paper}>
                <Typography variant="body2" align="center">
                    Please login or signup to see your profile information!
                </Typography>
                <div className={classes.buttons}>
                    <Button variant="contained" color="primary" component={Link} to="/login">
                        Login
                    </Button>
                    <Button variant="contained" color="secondary" component={Link} to="/signup">
                        Signup
                    </Button>
                </div>
            </Paper>
        )) : (<ProfileSkeleton/>);
        
        return profileMarkup;
    }
}

const mapStateToProps = (state) => ({
    user: state.user
});

const mapActionsToProps = { logoutUser, uploadImage };

Profile.propsTypes = {
    logoutUser: PropTypes.func.isRequired,
    uploadImage: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapActionsToProps)(withStyles(style)(Profile));

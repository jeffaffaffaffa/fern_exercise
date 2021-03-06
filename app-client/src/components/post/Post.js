import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import PropTypes from 'prop-types';
import MyButton from '../../util/MyButton';
import DeletePost from './DeletePost';
import PostDialog from './PostDialog';
import LikeButton from './LikeButton';

//MUI
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';

//icons
import ChatIcon from '@material-ui/icons/Chat';

//redux
import { connect } from 'react-redux';

const style = {
    card: {
        position: 'relative',
        display: 'flex',
        marginBottom: 20
    },
    image: {
        minWidth: 150
    },
    content: {
        padding: 25,
        objectFit: 'cover'
    }
};

class Post extends Component {

    render() {
        dayjs.extend(relativeTime);
        //same as const classes = this.props.classes
        const { 
            classes, 
            post: {
                postId, 
                body, 
                createdAt, 
                numLikes, 
                numComments, 
                imageUrl, 
                username
            },
            user: { authenticated, credentials: { username: userhandle } } 
        } = this.props;

        //can rename a variable when destructuring: https://flaviocopes.com/how-to-rename-object-destructuring/

        const deleteButton = authenticated && userhandle === username ? (
            <DeletePost postId={postId}/>
        ) : null;

        return (
            <Card className={classes.card}>
                <CardMedia 
                    image = { imageUrl }
                    title = "Profile Image"
                    className = {classes.image}
                />
                <CardContent className={classes.content}>
                    <Typography variant = "h5" component={Link} to={`/users/${username}`} color="primary">@{username}</Typography>
                    
                    {deleteButton}
                    
                    <Typography variant = "body2" color = "textSecondary">{dayjs(createdAt).fromNow()}</Typography>
                    <Typography variant="body1">{body}</Typography>

                    <LikeButton postId={postId}/>
                    <span>{numLikes} Likes</span>
                    
                    <MyButton tip="Expand post to see comments">
                        <ChatIcon color="primary"/>
                    </MyButton>
                    <span>{numComments} Comments</span>
                    <PostDialog postId={postId} username={username} openDialog={this.props.openDialog}/>
                </CardContent>
            </Card>
        );
    }
}

Post.propTypes = {
    user: PropTypes.object.isRequired,
    post: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    openDialog: PropTypes.bool
};

const mapStateToProps = state => ({
    user: state.user
});

export default connect(mapStateToProps)(withStyles(style)(Post));

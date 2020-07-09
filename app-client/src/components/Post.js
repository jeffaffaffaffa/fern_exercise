import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import PropTypes from 'prop-types';
import MyButton from '../util/MyButton';
import DeletePost from './DeletePost';
import PostDialog from './PostDialog';

//MUI
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';

//icons
import ChatIcon from '@material-ui/icons/Chat';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';

//redux
import { connect } from 'react-redux';
import { likePost, dislikePost } from '../redux/actions/dataActions';

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

    likedPost = () => {
        //if likes exist and if it can find where the post id is the same (means have already liked)
        if (this.props.user.likes && this.props.user.likes.find(like => like.postId === this.props.post.postId)) {
            return true;
        } else {
            return false;
        }
    }

    likePost = () => {
        this.props.likePost(this.props.post.postId);
    }

    dislikePost = () => {
        this.props.dislikePost(this.props.post.postId);
    }

    render() {
        dayjs.extend(relativeTime);
        //same as const classes = this.props.classes
        const { 
            classes, 
            post : { body, createdAt, imageUrl, username, postId, numLikes, numComments },
            user: { authenticated, credentials: { username: userhandle } } 
        } = this.props;

        //can rename a variable when destructuring: https://flaviocopes.com/how-to-rename-object-destructuring/

        //if not logged in, like button redirects to login page. otherwise it is a normal like button
        const likeButton = !authenticated ? (
            <MyButton tip="Like">
                <Link to="/login">
                    <FavoriteBorder color="primary"/>
                </Link>
            </MyButton>
        ) : (
            this.likedPost() ? (
                <MyButton tip="Remove like" onClick={this.dislikePost}>
                    <FavoriteIcon color="primary"/>
                </MyButton>
            ) : (
                <MyButton tip="Like" onClick={this.likePost}>
                    <FavoriteBorder color="primary"/>
                </MyButton>
            )
        );

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
                    <Typography variant = "h5" component={Link} to={`/users/${username}`} color="primary">{ username }</Typography>
                    
                    {deleteButton}
                    
                    <Typography variant = "body2" color = "textSecondary">{dayjs(createdAt).fromNow()}</Typography>
                    <Typography variant="body1">{body}</Typography>

                    {likeButton}
                    <span>{numLikes} Likes</span>
                    <MyButton tip="comments">
                        <ChatIcon color="primary"/>
                    </MyButton>
                    <span>{numComments} Comments</span>
                    <PostDialog postId={postId} username={username}/>
                </CardContent>
            </Card>
        );
    }
}

Post.propTypes = {
    likePost: PropTypes.func.isRequired,
    dislikePost: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    post: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
    user: state.user
})

const mapActionsToProps = {
    likePost,
    dislikePost
}

export default connect(mapStateToProps, mapActionsToProps)(withStyles(style)(Post));

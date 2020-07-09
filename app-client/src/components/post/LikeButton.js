import React, { Component } from 'react';
import MyButton from '../../util/MyButton';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

//icons
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';

//redux
import { connect } from 'react-redux';
import { likePost, dislikePost } from '../../redux/actions/dataActions';

class LikeButton extends Component {

    likedPost = () => {
        //if likes exist and if it can find where the post id is the same (means have already liked)
        if (this.props.user.likes && this.props.user.likes.find(like => like.postId === this.props.postId)) {
            return true;
        } else {
            return false;
        }
    }

    likePost = () => {
        this.props.likePost(this.props.postId);
    }

    dislikePost = () => {
        this.props.dislikePost(this.props.postId);
    }

    render() {
        const { authenticated } = this.props.user;
        //if not logged in, like button redirects to login page. otherwise it is a normal like button
        const likeButton = !authenticated ? (
            <Link to="/login">
                <MyButton tip="Like">
                    <FavoriteBorder color="primary"/>
                </MyButton>
            </Link>
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
        return likeButton;
    }
}

LikeButton.propTypes = {
    user: PropTypes.object.isRequired,
    postId: PropTypes.string.isRequired,
    likePost: PropTypes.func.isRequired,
    dislikePost: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    user: state.user
});

const mapActionsToProps = {
    likePost,
    dislikePost
};

export default connect(mapStateToProps, mapActionsToProps)(LikeButton);
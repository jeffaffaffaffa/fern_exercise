import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';

import Post from '../components/post/Post';
import Profile from '../components/profile/Profile';

import { connect } from 'react-redux';
import { getPosts } from '../redux/actions/dataActions';

class home extends Component {
    // initialize our state with what we want
    state = {
        posts: null
    }
    // link to backend route
    componentDidMount() {
        this.props.getPosts();
    }
    render() {
        const { posts, loading } = this.props.data;
        //if there are posts, we show the post body, else we say loading...
        let recentPostsMarkup = !loading ? (
            //for each post, show something
            // each child needs unique key property
            posts.map(post => <Post key = { post.postId } post = { post }/>)
        ) : (
            <p>Loading...</p>
        );
        
        return (
            <Grid container spacing={6}>
                <Grid item sm={8} xs={12}>
                    { recentPostsMarkup }
                </Grid>
                <Grid item sm={4} xs={12}>
                    <Profile>Profile...</Profile>
                </Grid>
            </Grid>
        )
    }
}

home.propTypes = {
    getPosts: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
    data: state.data
})

export default connect(mapStateToProps, { getPosts })(home);

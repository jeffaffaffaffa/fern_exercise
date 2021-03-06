import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';

import Post from '../components/post/Post';
import Profile from '../components/profile/Profile';
import PostSkeleton from '../util/PostSkeleton';

import { connect } from 'react-redux';
import { getPosts } from '../redux/actions/dataActions';

class home extends Component {
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
            <PostSkeleton/>
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

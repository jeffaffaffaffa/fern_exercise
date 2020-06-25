import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid';
import axios from 'axios';

import Post from '../components/Post';
import Profile from '../components/Profile';

class home extends Component {
    // initialize our state with what we want
    state = {
        posts: null
    }
    // link to backend route
    componentDidMount() {
        axios.get('/posts')
            .then(res => {
                // console.log(res.data);
                this.setState({
                    posts: res.data
                })
            })
            .catch(err => console.log(err));
    }
    render() {
        //if there are posts, we show the post body, else we say loading...
        let recentPostsMarkup = this.state.posts ? (
            //for each post, show something
            // each child needs unique key property
            this.state.posts.map(post => <Post key = { post.postId } post = { post }/>)
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

export default home

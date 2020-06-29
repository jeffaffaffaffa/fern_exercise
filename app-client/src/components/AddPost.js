import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import MyButton from '../util/MyButton';

//mui 
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';

//redux
import { connect } from 'react-redux';
import { addPost } from '../redux/actions/dataActions';

const style = theme => ({
    ...theme.spreadThis,
    submitButton: {
        position: 'relative'
    },
    progressSpinner: {
        position: 'absolute'
    },
    closeButton: {
        position: 'absolute',
        left: '90%',
        top: '10%'
    }
});

class AddPost extends Component {
    state = {
        open: false,
        body: '',
        errors: {}
    };

    //receives the errors from props
    componentWillReceiveProps(nextProps) {
        //if there are errors, we set the errors in state
        if (nextProps.UI.errors) {
            this.setState({
                errors: nextProps.UI.errors
            });
        };
        //if no errors and done loading, we want to clear the text in body
        if (!nextProps.UI.errors && !nextProps.UI.loading) {
            this.setState({ body: '' });
            this.handleClose();
        };
    };

    handleOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({ open: false, errors: {} });
    };

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleSubmit = (event) => {
        event.preventDefault();
        this.props.addPost({ body: this.state.body });
    };

    render() {
        const { errors } = this.state;
        //want the loading animation for submitting post
        const { classes, UI: { loading }} = this.props;
        return (
            <Fragment>
                <MyButton onClick={this.handleOpen} tip="Create a New Post">
                    <AddIcon/>
                </MyButton>
                <Dialog
                    open={this.state.open}
                    onClose={this.handleClose}
                    fullWidth
                    maxWidth="sm"
                >
                    <MyButton tip="Close" onClick={this.handleClose} tipClassName={classes.closeButton}>
                        <CloseIcon/>
                    </MyButton>
                    <DialogTitle>Create a new post</DialogTitle>
                    <DialogContent>
                        <form onSubmit={this.handleSubmit}>
                            <TextField 
                                name="body"
                                type="text"
                                label="Post"
                                multiline
                                rows="3"
                                placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                                error={errors.body ? true : false}
                                helperText={errors.body}
                                className={classes.textField} 
                                onChange={this.handleChange}
                                fullWidth
                            />
                            <Button type="submit" variant="contained" color="primary"
                                className={classes.submitButton} disabled={loading}>
                                    Submit
                                    {loading && (<CircularProgress size={30} className={classes.progressSpinner}/>)}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </Fragment>
        )
    }
}

AddPost.propTypes = {
    addPost: PropTypes.func.isRequired,
    UI: PropTypes.object.isRequired
};

//again, mapping the state to properties (UI is from elsewhere)
const mapStateToProps = (state) => ({
    UI: state.UI
});

export default connect(mapStateToProps, { addPost })(withStyles(style)(AddPost));
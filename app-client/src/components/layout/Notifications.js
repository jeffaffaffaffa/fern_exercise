import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import PropTypes from 'prop-types';

//mui
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Badge from '@material-ui/core/Badge';

//icons
import NotificationsIcon from '@material-ui/icons/Notifications';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ChatIcon from '@material-ui/icons/Chat';

//redux
import { connect } from 'react-redux';
import { markNotificationsRead } from '../../redux/actions/userActions';

class Notifications extends Component {
    state = {
        anchorEl: null
    };

    handleOpen = (event) => {
        this.setState({ anchorEl: event.target });
    }

    handleClose = () => {
        this.setState({ anchorEl: null });
    }

    onMenuOpened = () => {
        //need to send array of notif ids to backend to mark read
        let unreadNotifIds = this.props.notifications
            .filter(notif => !notif.read)
            .map(notif => notif.notificationId);

        this.props.markNotificationsRead(unreadNotifIds);
    }

    render() {
        const notifications = this.props.notifications;
        const anchorEl = this.state.anchorEl;

        dayjs.extend(relativeTime);

        let notificationsIcon;
        if (notifications && notifications.length > 0) {
            //only the notifs that are not read (the number of them)
            notifications.filter(notif => notif.read === false).length > 0
                ? notificationsIcon = (
                    //badge content is the number
                    <Badge badgeContent={notifications.filter(notif => notif.read === false).length}
                        color="secondary"
                    >
                        <NotificationsIcon/>
                    </Badge>
                ) : (
                    notificationsIcon = <NotificationsIcon/>
                );
        } else {
            notificationsIcon = <NotificationsIcon/>;
        }

        let notificationsMarkup = notifications && notifications.length > 0 ? (
            notifications.map(notif => {
                const action = notif.type === 'like' ? 'liked' : 'commented on';
                const time = dayjs(notif.createdAt).fromNow();
                const iconColor = notif.read ? "primary" : "secondary";
                const icon = notif.type === 'like' ? (
                    <FavoriteIcon color={iconColor} style={{ marginRight: 10 }}/>
                ) : (
                    <ChatIcon color={iconColor} style={{ marginRight: 10 }}/>
                )

                return (
                    <MenuItem key={notif.createdAt} onClick={this.handleClose}>
                        {icon}
                        <Typography
                            component={Link}
                            color="primary"
                            variant="body1"
                            to={`/users/${notif.recipient}/posts/${notif.postId}`}
                        >
                            {notif.sender} {action} your post {time}
                        </Typography>
                    </MenuItem>
                )
            })
        ) : (
            <MenuItem onClick={this.handleClose}>
                You have no notifications
            </MenuItem>
        )

        return (
            <Fragment>
                <Tooltip placement="top" title="Notifications">
                    <IconButton aria-owns={anchorEl ? 'simple-menu' : undefined}
                        aria-haspopup="true"
                        onClick={this.handleOpen}
                    >
                        {notificationsIcon}
                    </IconButton>
                </Tooltip>
                <Menu anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleClose}
                    onEntered={this.onMenuOpened}
                >
                    {notificationsMarkup}
                </Menu>
            </Fragment>
        );
    }
}

Notifications.propTypes = {
    markNotificationsRead: PropTypes.func.isRequired,
    notifications: PropTypes.array.isRequired
};

const mapStateToProps = state => ({
    notifications: state.user.notifications
});

export default connect(mapStateToProps, { markNotificationsRead })(Notifications);
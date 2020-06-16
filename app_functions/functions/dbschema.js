//FILE THAT SHOWS DATABASE SCHEMA
//WILL NOT BE USED ANYWHERE

let db = {
    users: [
        {
            userId: 'akhgaejwdeakjoeajfoej',
            email: 'user@email.com',
            username: 'user',
            createdAt: '2019-03-15T11:46:01.018Z',
            imageUrl: 'image/akdjsskdjkasjd/akdjfkaj',
            bio: 'Hello',
            website: 'https://user.com',
            location: 'London, UK'
        }
    ],
    posts: [
        {
            username: 'user',
            body: 'body',
            createdAt: '2019-03-15T11:46:01.018Z',
            numLikes: 5,
            numComments: 2
        }
    ],
    comments: [
        {
            username: 'user',
            postId: 'kjfajsdjskadj', //corresponds to the post it came from
            body: 'nice',
            createdAt: '2019-03-15T11:46:01.018Z'
        }
    ],
    notifications: [
        {
            recipient: 'user',
            sender: 'john',
            read: 'true | false',
            postId: 'afdlakflkds', //corresponds to post it came from
            type: 'like | comment',
            createdAt: '2019-03-15T11:46:01.018Z'
        }
    ]
};

const userDetails = {
    credentials: {
        userId: 'dfjdfj',
        email: 'email@email.com',
        username: 'user',
        createdAt: '2019-03-15T11:46:01.018Z',
        imageUrl: 'image/kajsja/asjdksd',
        bio: "bio",
        website: 'https://user.com',
        location: 'Stl'
    },
    likes: [
        {
            username: 'user',
            postId: 'akfjskdjasdk'
        },
        {
            username: 'user',
            postId: 'asldsakd'
        }
    ]
};
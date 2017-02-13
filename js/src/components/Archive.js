import React from 'react';
import ReactDOM from 'react-dom';
import Post from './Post';

class Archive extends React.Component {

    constructor() {
        super();
    }

    render() {

        let posts = this.props.posts.map(post => {
            return <Post post={post} key={post.id} />;
        });

        return (
            <div>{posts}</div>
        );
    }
}

export default Archive;

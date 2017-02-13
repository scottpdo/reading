import React from 'react';
import ReactDOM from 'react-dom';
import Post from './Post';

class Archive extends React.Component {

    constructor() {
        super();
    }

    render() {

        let posts = this.props.posts.map(post => {
            return (
                <Post title={post.title} key={post.id} />;
            );
        });

        return {posts};
    }
}

export default Archive;

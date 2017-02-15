import React from 'react';
import ReactDOM from 'react-dom';
import Post from './Post';

class Archive extends React.Component {

    constructor() {
        super();

        this.state = {
            loggedIn: window.CONFIG.user.loggedIn
        };
    }

    componentDidMount() {

    }

    render() {

        let posts = this.props.posts.map(post => {
            return <Post post={post} showLink={post.opts.showLink} key={post.id} loggedIn={this.state.loggedIn} />;
        });

        return (
            <div>{posts}</div>
        );
    }
}

export default Archive;

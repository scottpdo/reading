import React from 'react';

class Post extends React.Component {

    constructor() {
        super();
    }

    render() {

        let content = {
            __html: this.props.post.content
        };

        return (
            <div>
                <h1>{this.props.post.title}</h1>
                <div dangerouslySetInnerHTML={content} />
            </div>
        );
    }
}

export default Post;

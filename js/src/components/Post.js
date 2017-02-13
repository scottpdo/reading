import React from 'react';

class Post extends React.Component {

    constructor() {
        super();
    }

    render() {

        let req = new XMLHttpRequest();
        

        return (
            <div>
                <h1>{this.props.title}</h1>
                {content}
            </div>
        );
    }
}

export default Post;

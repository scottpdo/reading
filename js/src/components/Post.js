import React from 'react';
import axios from 'axios';

class Post extends React.Component {

    constructor() {
        super();

        this.state = {
            updating: false,
            tags: []
        };
    }

    componentDidMount() {
        this.setState({
            tags: this.props.post.tags
        });
    }

    editTag(e) {

    }

    update(e) {
        
    }

    render() {

        let post = this.props.post;

        let title = this.props.showLink ?
            <h1><a href={post.permalink}>{post.title}</a></h1> :
            <h1>{post.title}</h1>;

        let meta = post.author && post.year ?
            <div>{post.author.join(', ')}, {post.year}</div> :
            (this.props.loggedIn ?
                <div><a href={post.editLink}>Add author and year</a></div> :
                null);

        let content = {
            __html: post.content
        };

        let tags = post.tags.map((tag, i) => {
            let key = 'tag-' + i;
            return <input type="text" key={key} value={tag} onChange={this.editTag.bind(this)} />;
        });

        return (
            <div>
                {title}
                {meta}
                <div dangerouslySetInnerHTML={content} />
            </div>
        );
    }
}

export default Post;

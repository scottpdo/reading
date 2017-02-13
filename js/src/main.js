import React from 'react';
import ReactDOM from 'react-dom';
import Archive from './components/Archive';

ReactDOM.render(<Archive posts={window.POSTS} />, document.getElementById('archive'));

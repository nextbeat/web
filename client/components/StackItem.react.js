import React from 'react'
import moment from 'moment'

class StackItem extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { stack } = this.props;
        return (
            <div className="stack-item">
                <div className="thumb">
                    <img src={stack.get('thumbnail_url')} />
                </div>
                <div className="info">
                    <div className="description">{stack.get('description')}</div>
                    <div className="details">
                        <span className="channel">{stack.getIn(['channel', 'name'])}</span>
                        <span className="time">{moment(stack.get('most_recent_post_at')).fromNow()}</span>
                    </div>
                </div>
                <div className="bookmarks">
                    {stack.get('bookmark_count')}<img src="/images/bookmark.png"/>
                </div>
                {!stack.get('closed') && <span className="open">OPEN</span>}
            </div>
        );
    }
}

export default StackItem;

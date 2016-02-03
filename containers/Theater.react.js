import React from 'react'
import { connect } from 'react-redux'
import { isEmpty } from 'lodash'
import { Map, List } from 'immutable'

import Activity from '../components/Activity.react'
import MediaPlayer from '../components/MediaPlayer.react'
import Chat from '../containers/Chat.react'
import Header from '../components/Header.react'
import Info from '../components/Info.react'

import { loadStack, loadMediaItems, selectMediaItem, goBackward, goForward } from '../actions'

class Theater extends React.Component {

    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    componentDidMount() {
        const { id, dispatch } = this.props
        dispatch(loadStack(id))

        $(document.body).on('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        $(document.body).off('keydown', this.handleKeyDown);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.stack.get('id') !== this.props.stack.get('id')) {
            // stack has loaded
            this.props.dispatch(loadMediaItems());
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.mediaItems.size > 0 && prevProps.mediaItems.size === 0) {
            // first page of media items has loaded
            const id = this.props.mediaItems.first().get('id');
            this.props.dispatch(selectMediaItem(id));
        }
    }

    handleClick(mediaItem) {
        this.props.dispatch(selectMediaItem(mediaItem.get('id')));
    }

    handleKeyDown(e) {
        if (e.keyCode === 37) { // left arrow
            this.props.dispatch(goBackward());
        } else if (e.keyCode === 39) {
            this.props.dispatch(goForward()); // right arrow
        }
    }

    render() {
        const { isFetching, error, stack, author, mediaItems, selectedMediaItem } = this.props
        return (
        <section>
            <Header/>
            {isFetching && <p>Loading...</p>}
            {error && error.length > 0 && <p>Could not load stack.</p>}
            <div id="theater">
                <section id="theater-main">
                    <Activity mediaItems={mediaItems} selectedItem={selectedMediaItem} handleClick={this.handleClick}/>
                    <MediaPlayer item={selectedMediaItem} />
                    <div className="clear"></div>
                    <Info stack={stack} author={author} />
                </section>
                <Chat stack={stack} />
            </div>
        </section>
        );
    }
}

function mapStateToProps(state, props) {
    const stack = state.getIn(['entities', 'stacks', props.id], Map())
    const author = state.getIn(['entities', 'users', stack.get('author', 0).toString()], Map())

    const isFetching = state.getIn(['stack', 'isFetching'], false)
    const error = state.getIn(['stack', 'error'])

    const mediaItems = state.getIn(['pagination', 'mediaItems', 'ids'], List())
        .map(id => state.getIn(['entities', 'mediaItems', id.toString()]));

    const selectedId = state.getIn(['mediaItems', 'selected'], -1);
    const selectedMediaItem = selectedId >= 0 ? state.getIn(['entities', 'mediaItems', selectedId.toString()]) : Map();

    return {
        stack,
        author,
        isFetching,
        error,
        mediaItems,
        selectedMediaItem
    }
}

export default connect(mapStateToProps)(Theater);

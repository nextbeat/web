import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import { loadEmojis, addEmoji, removeEmoji } from '@actions/pages/creator/community'
import Emoji from '@models/objects/emoji'
import Community from '@models/state/pages/creator/community'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    isFetching: boolean
    hasFetched: boolean
    error?: string
    emojis: List<Emoji>

    isAdding: boolean
    addError?: string
    isRemoving: boolean
    removeError?: string
}

type Props = ConnectProps & DispatchProps

class Emojis extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.handleRemoveClick = this.handleRemoveClick.bind(this)
        this.renderEmoji = this.renderEmoji.bind(this)
    }

    componentDidMount() {
        this.props.dispatch(loadEmojis())
    }

    handleRemoveClick(emoji: Emoji) {
        this.props.dispatch(removeEmoji(emoji.get('name')))
    }

    renderEmoji(emoji: Emoji) {
        return (
            <div className="community_box_element" key={emoji.get('name')}>
                <div 
                    className="community_box_element_thumbnail" 
                    style={{backgroundImage: `url(${emoji.url()})`}}
                />
                <div className="community_box_element_text">{ emoji.get('name') }</div>
                <div className="community_box_element_remove" onClick={this.handleRemoveClick.bind(this, emoji)}>Remove</div>
            </div>
        )
    }

    render() {
        const { isFetching, hasFetched, emojis } = this.props
        return (
            <div className="community_box">
                <div className="community_box_list">
                    { emojis.map(emoji => this.renderEmoji(emoji)) }
                </div>
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        isFetching: Community.get(state, 'isFetchingEmojis'),
        hasFetched: Community.get(state, 'hasFetchedEmojis'),
        error: Community.get(state, 'emojisError'),
        emojis: Community.emojis(state),

        isAdding: Community.get(state, 'isAddingEmoji'),
        addError: Community.get(state, 'addEmojiError'),
        isRemoving: Community.get(state, 'isRemovingEmoji'),
        removeError: Community.get(state, 'removeEmojiError')
    }
}

export default connect(mapStateToProps)(Emojis)


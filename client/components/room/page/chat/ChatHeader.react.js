import React from 'react'
import { connect } from 'react-redux'

import Icon from '../../../shared/Icon.react'
import { searchChat } from '../../../../actions'

class ChatHeader extends React.Component {

    constructor(props) {
        super(props)
        
        this.renderTag = this.renderTag.bind(this)
    }

    renderTag(tag) {
        const { dispatch } = this.props
        let handleClick = () => {
            dispatch(searchChat(tag, true))
        }
        return (
            <div onClick={handleClick} className="chat_header_tag" key={tag}>{tag}</div>
        )
    }

    render() {
        const { tags } = this.props
        return (
            <div className="chat_header_container">
                <div className="chat_header">
                    <Icon type="whatshot" />
                    <div className="chat_header_tags_container">
                        <div className="chat_header_tags">
                            { tags.map(t => this.renderTag(t))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

ChatHeader.propTypes = {
    tags: React.PropTypes.object
}

ChatHeader.defaultProps = {
    tags: []
}

export default connect()(ChatHeader)

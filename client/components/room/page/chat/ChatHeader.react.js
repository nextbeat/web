import React from 'react'
import { connect } from 'react-redux'

import Icon from '../../../shared/Icon.react'
import { searchChat, closeDetailSection } from '../../../../actions'
import { App } from '../../../../models'

class ChatHeader extends React.Component {

    constructor(props) {
        super(props)

        this.handleClose = this.handleClose.bind(this)
        this.renderTag = this.renderTag.bind(this)
    }

    handleClose() {
        this.props.dispatch(closeDetailSection())
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
        const { tags, app } = this.props
        let isOverlayActive = app.get('activeOverlay') === 'chat'

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
                { isOverlayActive &&
                    <div className="chat_header_close" onClick={this.handleClose}>
                        <Icon type="expand-more" />
                    </div>
                }
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

function mapStateToProps(state) {
    return {
        app: new App(state)
    }
}

export default connect(mapStateToProps)(ChatHeader)

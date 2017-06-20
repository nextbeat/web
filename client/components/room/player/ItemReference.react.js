import React from 'react'
import { connect } from 'react-redux'

import Icon from '../../shared/Icon.react'
import { timeString } from '../../../utils'

import { jumpToComment, selectDetailSection } from '../../../actions'

class ItemReference extends React.Component {

    constructor(props) {
        super(props);

        this.handleCollapseClick = this.handleCollapseClick.bind(this)
        this.handleCommentClick = this.handleCommentClick.bind(this)
        
        this.state = {
            collapsed: false,
            compact: this.props.containerWidth < 500,
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ compact: nextProps.containerWidth < 500 })
    }

    handleCollapseClick() {
        this.setState({ collapsed: !this.state.collapsed })
    }

    handleCommentClick() {
        const { dispatch, room } = this.props
        const comment = room.selectedMediaItem().referencedComment()

        dispatch(jumpToComment(room.id, comment))
        dispatch(selectDetailSection('chat'))
    }

    render() {
        const { room } = this.props 
        const { collapsed, compact } = this.state

        const item = room.selectedMediaItem()
        const comment = item.referencedComment()

        if (!comment) {
            return null;
        }

        const collapsedClass = collapsed ? "collapsed" : "";
        const compactClass = compact ? "compact" : "";

        return (
            <div className={`player_reference ${collapsedClass} ${compactClass}`}>
                <div className="player_reference_icon_container">
                    <div className="player_reference_icon">
                        <Icon type="reply" />
                    </div>
                </div>
                <div className="player_reference_main_container">
                    <div className="player_reference_main">
                        <div className="player_reference_comment" onClick={this.handleCommentClick}>
                            <div className="player_reference_comment_info">
                                <span className="player_reference_comment_username">{comment.author().get('username')}</span>
                                <span className="player_reference_comment_timestamp">{timeString(comment.get('created_at'))}</span>
                            </div>
                            <div className="player_reference_comment_body">
                                {comment.get('message')}
                            </div>
                        </div>
                        <div className="player_reference_collapse" onClick={this.handleCollapseClick}>
                            <Icon type="arrow-drop-down"/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

ItemReference.propTypes = {
    room: React.PropTypes.object.isRequired
}

export default connect()(ItemReference)
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'

import Icon from '../../shared/Icon.react'
import { timeString } from '../../../utils'

import { jumpToComment, selectDetailSection, hideSearchChatResults } from '../../../actions'

class ItemReference extends React.Component {

    constructor(props) {
        super(props);

        this.handleCollapseClick = this.handleCollapseClick.bind(this)
        this.handleCommentClick = this.handleCommentClick.bind(this)
        
        this.state = {
            collapsed: false,
            animated: true,
            compact: this.props.containerWidth < 500,
        }
    }


    // Component lifecycle

    componentDidMount() {
        $(this.refs.text).dotdotdot({
            watch: true,
            height: 50
        })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ compact: nextProps.containerWidth < 500 })

        if (nextProps.room.selectedMediaItem() !== this.props.room.selectedMediaItem()) {
            $(this.refs.text).trigger('destroy.dot')
            this.setState({ collapsed: false, animated: false })
            setTimeout(() => this.setState({ animated: true }), 100)
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.room.selectedMediaItem() !== this.props.room.selectedMediaItem()) {
            $(this.refs.text).dotdotdot({
                watch: true,
                height: 50
            })
        }
    }


    // Actions

    handleCollapseClick() {
        this.setState({ collapsed: !this.state.collapsed })
    }

    handleCommentClick() {
        const { dispatch, room } = this.props
        const comment = room.selectedMediaItem().referencedComment()

        dispatch(jumpToComment(room.id, comment))
        dispatch(hideSearchChatResults())
        dispatch(selectDetailSection('chat'))
    }


    // Render

    render() {
        const { room } = this.props 
        const { collapsed, compact, animated } = this.state

        const item = room.selectedMediaItem()
        const comment = item.referencedComment()

        if (!comment) {
            return null;
        }

        const collapsedClass = collapsed ? "collapsed" : "";
        const compactClass = compact ? "compact" : "";
        const animatedClass = animated ? "animated": "";

        return (
            <div className={`player_reference ${collapsedClass} ${compactClass} ${animatedClass}`}>
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
                            <div ref="text" className="player_reference_comment_body">
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
    room: PropTypes.object.isRequired
}

export default connect()(ItemReference)
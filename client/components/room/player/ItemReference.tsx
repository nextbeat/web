import * as React from 'react'
import { connect } from 'react-redux'

import Icon from '@components/shared/Icon'
import { selectDetailSection, hideSearchChatResults } from '@actions/pages/room'
import { jumpToComment } from '@actions/room'
import MediaItem from '@models/entities/mediaItem'
import Comment from '@models/entities/comment'
import { timeString } from '@utils'
import { State, DispatchProps } from '@types'

interface OwnProps {
    roomId: number
    containerWidth: number
}

interface ConnectProps {
    selectedMediaItem: MediaItem    
}

interface ItemReferenceState {
    collapsed: boolean
    animated: boolean
    compact: boolean
}

type AllProps = OwnProps & ConnectProps & DispatchProps

class ItemReference extends React.Component<AllProps, ItemReferenceState> {

    constructor(props: AllProps) {
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
        ($(this.refs.text) as any).dotdotdot({
            watch: true,
            height: 50
        })
    }

    componentWillReceiveProps(nextProps: AllProps) {
        this.setState({ compact: nextProps.containerWidth < 500 })

        if (nextProps.selectedMediaItem !== this.props.selectedMediaItem) {
            $(this.refs.text).trigger('destroy.dot')
            this.setState({ collapsed: false, animated: false })
            window.setTimeout(() => this.setState({ animated: true }), 100)
        }
    }

    componentDidUpdate(prevProps: AllProps) {
        if (prevProps.selectedMediaItem !== this.props.selectedMediaItem) {
            ($(this.refs.text) as any).dotdotdot({
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
        const { dispatch, selectedMediaItem, roomId } = this.props
        const comment = selectedMediaItem.referencedComment() as Comment

        dispatch(jumpToComment(roomId, comment))
        dispatch(hideSearchChatResults())
        dispatch(selectDetailSection('chat'))
    }


    // Render

    render() {
        const { selectedMediaItem } = this.props 
        const { collapsed, compact, animated } = this.state

        const comment = selectedMediaItem.referencedComment()

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

export default connect()(ItemReference)
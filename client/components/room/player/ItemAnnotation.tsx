import * as React from 'react'
import { connect } from 'react-redux'

import Icon from '@components/shared/Icon'
import renderMessageText from '@components/room/chat/utils/renderMessageText'

import { selectDetailSection, hideSearchChatResults } from '@actions/pages/room'
import { jumpToComment } from '@actions/room'
import Room from '@models/state/room'
import MediaItem from '@models/entities/mediaItem'
import Comment from '@models/entities/comment'
import { timeOfDayString } from '@utils'
import { State, DispatchProps } from '@types'

interface OwnProps {
    roomId: number
    containerWidth: number
}

interface ConnectProps {
    selectedMediaItem: MediaItem    
}

interface ItemAnnotationState {
    collapsed: boolean
    animated: boolean
    compact: boolean
}

type AllProps = OwnProps & ConnectProps & DispatchProps

class ItemAnnotation extends React.Component<AllProps, ItemAnnotationState> {

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

        if (!selectedMediaItem.hasReference()) {
            return;
        }

        const comment = selectedMediaItem.referencedComment() as Comment

        dispatch(jumpToComment(roomId, comment))
        dispatch(hideSearchChatResults())
        dispatch(selectDetailSection('chat'))
    }

    // Render

    renderReference() {
        const { selectedMediaItem } = this.props
        const comment = selectedMediaItem.referencedComment() as Comment

        return (
            <div className="item_annotation_comment" onClick={this.handleCommentClick}>
                <div className="item_annotation_comment_info">
                    <span className="item_annotation_comment_username">{comment.author().get('username')}</span>
                    <span className="item_annotation_comment_timestamp">{timeOfDayString(comment.get('created_at'))}</span>
                </div>
                <div ref="text" className="item_annotation_comment_body">
                    {renderMessageText(comment)}
                </div>
            </div>
        )
    }

    renderTitle() {
        const { selectedMediaItem } = this.props
        const title = selectedMediaItem.get('title')

        return (
            <div className="item_annotation_title">
                {title}
            </div>
        )
    }

    render() {
        const { selectedMediaItem } = this.props 
        const { collapsed, compact, animated } = this.state

        if (!selectedMediaItem.hasAnnotation()) {
            return null;
        }

        const annotationType = selectedMediaItem.hasReference() ? 'reference' : 'title'

        const collapsedClass = collapsed ? "collapsed" : "";
        const compactClass = compact ? "compact" : "";
        const animatedClass = animated ? "animated": "";

        return (
            <div className={`item_annotation item_annotation-${annotationType} ${collapsedClass} ${compactClass} ${animatedClass}`}>
                <div className="item_annotation_icon_container">
                    <div className="item_annotation_icon">
                        <Icon type="reply" />
                    </div>
                </div>
                <div className="item_annotation_main_container">
                    <div className="item_annotation_main">
                        <div className="item_annotation_content">
                            { annotationType === 'reference' && this.renderReference() }
                            { annotationType === 'title' && this.renderTitle() }
                        </div>
                        <div className="item_annotation_collapse" onClick={this.handleCollapseClick}>
                            <Icon type="arrow-drop-down"/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {
    return {
        selectedMediaItem: Room.selectedMediaItem(state, ownProps.roomId)
    }
}

export default connect(mapStateToProps)(ItemAnnotation)
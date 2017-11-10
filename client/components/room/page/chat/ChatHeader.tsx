import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import Icon from '@components/shared/Icon'
import { searchChat, closeDetailSection } from '@actions/pages/room'
import App from '@models/state/app'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    isOverlayActive: boolean
    tags: List<string>
}   

type Props = ConnectProps & DispatchProps

class ChatHeader extends React.Component<Props> {
    
    static defaultProps: Partial<Props> = {
        tags: List()
    }

    constructor(props: Props) {
        super(props)

        this.handleClose = this.handleClose.bind(this)
        this.renderTag = this.renderTag.bind(this)
    }

    handleClose() {
        this.props.dispatch(closeDetailSection())
    }

    renderTag(tag: string) {
        const { dispatch } = this.props
        let handleClick = () => {
            dispatch(searchChat(tag, true))
        }
        return (
            <div onClick={handleClick} className="chat_header_tag" key={tag}>{tag}</div>
        )
    }

    render() {
        const { tags, isOverlayActive } = this.props

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

function mapStateToProps(state: State) {
    return {
        isOverlayActive: App.get(state, 'activeOverlay') === 'chat'
    }
}

export default connect(mapStateToProps)(ChatHeader)

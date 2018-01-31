import * as React from 'react'
import { connect } from 'react-redux'

import LargeStackItem from '@components/shared/LargeStackItem'
import Icon from '@components/shared/Icon'

import { selectStackForUpload } from '@actions/upload'
import Upload, { UploadType } from '@models/state/upload'
import Stack from '@models/entities/stack'
import { State, DispatchProps } from '@types'

interface OwnProps {
    stack: Stack | null
    width: number
}

interface ConnectProps {
    isSelectedStack: boolean
}

type Props = OwnProps & ConnectProps & DispatchProps

class SelectableStackItem extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.handleClick = this.handleClick.bind(this)
        this.renderNewStack = this.renderNewStack.bind(this)
    }

    handleClick(e: React.MouseEvent<HTMLElement>) {
        // we call this method in the capture phase to prevent 
        // bubbling down to the LargeStackItem click event
        e.stopPropagation();
        e.preventDefault();

        const { dispatch, stack } = this.props
        let stackId = stack ? stack.get('id') : -1
        dispatch(selectStackForUpload(stackId))
    }

    renderNewStack() {
        return (
            <div className="item_container item-room-large_container">
                <div className="item-room-large item">
                    <div className="item_inner item-room-large_inner">
                        <div className="item_thumb item-room-large_thumb item-room-large-new_thumb">
                            <Icon type="add" />
                        </div>
                    </div>
                </div>
                <div className="item-room-large_info">
                    <div className="item-room-large_description item-room-large-new_description">Make a new room with this post.</div>
                </div>
            </div>
        )
    }

    render() {
        const { stack, isSelectedStack, width } = this.props

        return (
            <div 
            className={`upload_selectable-stack-item ${isSelectedStack ? 'selected' : ''}`}
            style={{ width: `${width}px` }}
            onClickCapture={this.handleClick}>
                { stack ? <LargeStackItem stack={stack} static={true} /> : this.renderNewStack() }
                <div className="upload_selectable-stack-item_check-box-container">
                    { isSelectedStack ? <Icon type="check-box"/> : <div className="upload_selectable-stack-item_check-box-outline" /> }
                </div>
            </div>
        );
    }
}

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {
    return {
        isSelectedStack: Upload.get(state, 'selectedStackId') === (ownProps.stack ? ownProps.stack.get('id') : -1),
    }
}

export default connect(mapStateToProps)(SelectableStackItem);

import React from 'react'
import { connect } from 'react-redux'

import { selectStackForUpload } from '../../actions'
import LargeStackItem from '../shared/LargeStackItem.react'
import Icon from '../shared/Icon.react'

class SelectableStackItem extends React.Component {

    constructor(props) {
        super(props)

        this.stackId = this.stackId.bind(this)
        this.handleClick = this.handleClick.bind(this)
    }

    stackId() {
        const { stack } = this.props 
        return stack ? stack.get('id') : -1
    }

    handleClick(e) {
        // we call this method in the capture phase to prevent 
        // bubbling down to the LargeStackItem click event
        e.stopPropagation();
        e.preventDefault();

        const { dispatch, stack } = this.props
        dispatch(selectStackForUpload(this.stackId()))
    }

    renderNewStack(upload) {
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
                    <div className="item-room-large_description item-room-large-new_description">Make a new room with this {upload.fileType()}.</div>
                </div>
            </div>
        )
    }

    render() {
        const { stack, upload, width } = this.props

        const isSelected = this.stackId() === upload.get('selectedStackId')

        return (
            <div 
            className={`upload_selectable-stack-item ${isSelected ? 'selected' : ''}`}
            style={{ width: `${width}px` }}
            onClickCapture={this.handleClick}>
                { stack ? <LargeStackItem stack={stack} static={true} /> : this.renderNewStack(upload) }
                <div className="upload_selectable-stack-item_check-box-container">
                    { isSelected ? <Icon type="check-box"/> : <div className="upload_selectable-stack-item_check-box-outline" /> }
                </div>
            </div>
        );
    }
}

export default connect()(SelectableStackItem);

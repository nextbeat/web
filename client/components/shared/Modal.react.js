import React from 'react'
import { connect } from 'react-redux'

import Icon from './Icon.react'
import { App } from '../../models'
import { closeModal } from '../../actions'

class Modal extends React.Component {

    constructor(props) {
        super(props)

        this.handleClose = this.handleClose.bind(this)
    }

    handleClose() {
        this.props.dispatch(closeModal())
    }

    render() {
        const { shouldDisplay, children, className } = this.props

        return (
            <div className="modal-container" style={{ display: shouldDisplay ? 'block' : 'none' }}>
                <div className={`modal ${className}`}>
                    <div className="modal_close" onClick={this.handleClose}><Icon type="close" /></div>
                    {children}
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, ownProps) {
    let app = new App(state)
    return {
        shouldDisplay: app.get('activeModal') === ownProps.name
    }
}

export default connect(mapStateToProps)(Modal);

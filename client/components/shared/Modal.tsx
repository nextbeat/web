import * as React from 'react'
import { connect } from 'react-redux'

import App from '@models/state/app'
import { closeModal } from '@actions/app'
import Icon from '@components/shared/Icon'
import { State, DispatchProps } from '@types'

interface OwnProps {
    name: string
    className?: string
}

interface ConnectProps {
    shouldDisplay: boolean
}

type AllProps = OwnProps & ConnectProps & DispatchProps

class Modal extends React.Component<AllProps> {

    constructor(props: AllProps) {
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

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {
    return {
        shouldDisplay: App.get(state, 'activeModal') === ownProps.name
    }
}

export default connect(mapStateToProps)(Modal);

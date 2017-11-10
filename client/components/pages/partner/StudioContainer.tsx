import * as React from 'react'
import { createPortal } from 'react-dom'

// TODO: componentWillReceiveProps check for authorized user

class StudioContainer extends React.Component {

    render() {
        return (
            <div className="studio">
                { this.props.children }
            </div>
        )
    }
}

export default StudioContainer
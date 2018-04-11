import * as React from 'react'

class ConnectSuccess extends React.Component {

    componentDidMount() {
        if (!window.opener) {
            return
        }

        window.opener.postMessage('success', window.location.origin)
        window.close()
    }

    render() {
        return <div />
    }
}

export default ConnectSuccess;
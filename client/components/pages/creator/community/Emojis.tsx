import * as React from 'react'
import { connect } from 'react-redux'

import { loadEmojis, addEmoji, removeEmoji } from '@actions/pages/creator/community'
import { State, DispatchProps } from '@types'

interface ConnectProps {

}

type Props = ConnectProps & DispatchProps

class Emojis extends React.Component<Props> {

    componentDidMount() {
        this.props.dispatch(loadEmojis())
    }

    render() {
        return (
            <div className="community_emojis">
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {

    }
}

export default connect(mapStateToProps)(Emojis)


import * as React from 'react'
import { List } from 'immutable'
import debounce from 'lodash-es/debounce'
import { connect } from 'react-redux'

import LargeChat from './LargeChat'
import SmallChat from './SmallChat'

import { resetChat } from '@actions/pages/room'
import { didUseChat } from '@actions/room'
import App from '@models/state/app'
import CurrentUser from '@models/state/currentUser'
import { State, DispatchProps } from '@types'

interface OwnProps {
    display: boolean
}

interface ConnectProps {
    isMobile: boolean
    isOverlayActive: boolean
    isLoggedIn: boolean
}

type Props = OwnProps & ConnectProps & DispatchProps

class Chat extends React.Component<Props> {

    constructor(props: Props) {
        super(props);

        this.handleOnWheel = this.handleOnWheel.bind(this);
    }

    componentDidMount() {
        $(window).on('focus.chat', () => {
            const { dispatch, isMobile, isOverlayActive} = this.props
            if (isOverlayActive && isMobile) {
                dispatch(resetChat())
            }
        })
    }

    componentWillUnmount() {
        $(window).off('focus.chat')
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.isLoggedIn !== prevProps.isLoggedIn) {
            this.props.dispatch(resetChat())
        }
    }


    // Events

    handleOnWheel() {
        this.props.dispatch(didUseChat())
    }

    render() {
        const { display, isOverlayActive } = this.props;

        return (
        <div className={`chat ${display ? 'selected' : 'unselected'}`} onWheel={debounce(this.handleOnWheel, 200)}>
            <LargeChat />
            <SmallChat />
        </div>
        );
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        isMobile: App.isMobile(state),
        isOverlayActive: App.get(state, 'activeOverlay') === 'chat',
        isLoggedIn: CurrentUser.isLoggedIn(state)
    }
}

export default connect(mapStateToProps)(Chat);

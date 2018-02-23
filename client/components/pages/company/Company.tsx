import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { Location } from 'history'

import Logo from '@components/shared/Logo'
import SmallLogo from '@components/shared/SmallLogo'
import App from '@models/state/app'
import { State } from '@types'

interface ComponentState {
    year: number
}

interface ConnectProps {
    location: Location
}

type Props = ConnectProps

class Company extends React.Component<Props, ComponentState> {
    constructor(props: Props) {
        super(props)

        this.state = {
            year: (new Date()).getUTCFullYear()
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.location !== this.props.location) {
            let scrollElem = document.getElementById('company_main')
            if (scrollElem) {
                scrollElem.scrollTo(0, 0)
            }
        }
    }

    render() {
        return (
            <div className="company">
                <div className="topbar topbar-company" id="topbar">
                    <div className="topbar_inner">
                        <div className="topbar_logo-container">
                            <span className="topbar_logo"><Link to="/"><Logo /></Link></span>
                            <span className="topbar_logo-small"><Link to="/"><SmallLogo /></Link></span>
                        </div>
                        <div className="topbar_right topbar-company_right">
                            <Link className="topbar-company_link" to="/company/about">ABOUT</Link>
                            <Link className="topbar-company_link" to="/company/contact">CONTACT</Link>
                            <Link className="topbar-company_link" to="/company/legal/terms">LEGAL</Link>
                        </div>
                    </div>
                </div>
                <div className="company_main" id="company_main">
                    { this.props.children }
                    <footer className="footer footer-company">
                        <div className="footer_copyright">
                            &copy; {this.state.year}, Bubl Inc.
                        </div>
                        <div className="footer_nav">
                            <Link className="footer_link" to="/company/contact">Contact</Link>
                            <Link className="footer_link" to="/company/legal/terms">Terms</Link>
                            <Link className="footer_link" to="/company/legal/privacy">Privacy</Link>
                        </div>
                    </footer>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        location: App.get(state, 'location')
    }
}

export default Company;
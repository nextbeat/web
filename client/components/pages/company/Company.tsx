import * as React from 'react'
import { Link } from 'react-router'

import Logo from '@components/shared/Logo'
import SmallLogo from '@components/shared/SmallLogo'

interface State {
    year: number
}

class Company extends React.Component<{}, State> {
    constructor() {
        super()

        this.state = {
            year: (new Date()).getUTCFullYear()
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
                            <Link className="topbar-company_link" to="/company/team">TEAM</Link>
                            <Link className="topbar-company_link" to="/company/legal/terms">LEGAL</Link>
                            <Link className="topbar-company_link" to="/company/advertise">ADVERTISE</Link>
                        </div>
                    </div>
                </div>
                <div className="company_main">
                    { this.props.children }
                    <footer className="company_footer">
                        <div className="company_footer_copyright">
                            &copy; {this.state.year}, Bubl Inc.
                        </div>
                        <div className="company_footer_nav">
                            <Link className="company_footer_link" to="/company/contact">Contact Us</Link>
                            <Link className="company_footer_link" to="/company/legal/terms">Terms</Link>
                            <Link className="company_footer_link" to="/company/legal/privacy">Privacy</Link>
                        </div>
                    </footer>
                </div>
            </div>
        )
    }
}

export default Company;
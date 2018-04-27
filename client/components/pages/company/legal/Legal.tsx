import * as React from 'react'
import { Link } from 'react-router'

class Legal extends React.Component {
    render() {
        return (
            <div className="legal">
                <div className="legal_sidebar">
                    <Link className="legal_sidebar_link" activeClassName="selected" to="/company/legal/terms">Terms of Service</Link>
                    <Link className="legal_sidebar_link" activeClassName="selected" to="/company/legal/privacy">Privacy Policy</Link>
                    <Link className="legal_sidebar_link" activeClassName="selected" to="/company/legal/guidelines">Community Guidelines</Link>
                    <Link className="legal_sidebar_link" activeClassName="selected" to="/company/legal/attributions">Attributions</Link>
                </div>
                <div className="legal_main">
                    { this.props.children }
                </div>
            </div>
        )
    }
}

export default Legal;
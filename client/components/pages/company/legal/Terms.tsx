import * as React from 'react'

import terms from './documents/terms.md';

class Terms extends React.Component {
    render() {
        return (
            <div className="legal_content">
                <div className="legal_header">
                    <div className="legal_title">Terms of Service</div>
                    <div className="legal_date">DATE LAST MODIFIED: April 8, 2016.</div>
                </div>
                <div dangerouslySetInnerHTML={{ __html: terms }} />
            </div>
        )
    }
}

export default Terms;
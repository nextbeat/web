import * as React from 'react'

import privacy from './documents/privacy.md';

class Privacy extends React.Component {
    render() {
        return (
            <div className="legal_content">
                <div className="legal_header">
                    <div className="legal_title">Privacy Policy</div>
                    <div className="legal_date">Effective Date: April 8, 2016</div>
                </div>
                <div dangerouslySetInnerHTML={{ __html: privacy }} />
            </div>
        )
    }
}

export default Privacy;
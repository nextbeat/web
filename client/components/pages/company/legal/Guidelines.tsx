import * as React from 'react'

import guidelines from './documents/guidelines.md';

class Guidelines extends React.Component {
    render() {
        return (
            <div className="legal_content">
                <div className="legal_header">
                    <div className="legal_title">Community Guidelines</div>
                    <div className="legal_date">Last Updated: April 27, 2018</div>
                </div>
                <div dangerouslySetInnerHTML={{ __html: guidelines }} />
            </div>
        )
    }
}

export default Guidelines;
import * as React from 'react'

import attributions from './documents/attributions.md';

class Attributions extends React.Component {
    render() {
        return (
            <div className="legal_content">
                <div className="legal_header">
                    <div className="legal_title">Attributions</div>
                </div>
                <div dangerouslySetInnerHTML={{ __html: attributions }} />
            </div>
        )
    }
}

export default Attributions;
import * as React from 'react'
import { Link } from 'react-router'

interface Props {
    platform: string
    title: string
}

class Creator extends React.Component<Props> {
    render() {
        const { platform, title, children } = this.props
        return (
            <div className={`creators creators-${platform}`}>
                <div className='creators_header'>
                    <div className='creators_header_content'>
                        <div className='creators_icon_container'>
                            <div className="creators_icon" />
                        </div>
                        <span className='creators_title'>
                            { title }
                        </span>
                    </div>
                </div>
                <div className="creators_content">
                    { children }
                    <section className="creators_section">
                        <div className="creators_separator" />
                        <p>Want to know more? We're happy to answer your questions — you can reach us at <a href="mailto:creators@nextbeat.co">creators@nextbeat.co</a>.</p> 
                    </section>
                </div>
            </div>
        )
    }
}

export default Creator;
import * as React from 'react'
import { Link } from 'react-router'
import Creator from './creators/Creator'

class Brands extends React.Component {
    render() {
        return (
            <div className="creators">
                <div className='creators_header'>
                    <div className='creators_header_content'>
                        <span className='creators_title'>
                            Brands
                        </span>
                    </div>
                </div>
                <div className="creators_content">
                    <div className="creators_main">
                        <section className="creators_section">
                            <h2>Welcome to Nextbeat!</h2>
                            <p>Nextbeat can offer you direct access to highly influential content creators, and can prominently feature your products for an active, highly engaged community of users.</p>
                        </section>
                    </div>
                    <section className="creators_section">
                        <div className="creators_separator" />
                        <p>For partnership information, please reach out to <a href="mailto:partners@nextbeat.co">partners@nextbeat.co</a>.</p> 
                    </section>
                </div>
            </div>
        )
    }
}

export default Brands;
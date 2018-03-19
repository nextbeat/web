import * as React from 'react'
import { Link } from 'react-router'
import Creator from './creators/Creator'

class Brands extends React.Component {
    render() {
        return (
            <div className="article">
                <div className='article_header'>
                    <div className='article_header_content'>
                        <span className='article_title'>
                            Brands
                        </span>
                    </div>
                </div>
                <div className="article_content">
                    <div className="article_main">
                        <section className="article_section">
                            <h2>Welcome to Nextbeat!</h2>
                            <p>Nextbeat can offer you direct access to highly influential content creators, and can prominently feature your products for an active, highly engaged community of users.</p>
                        </section>
                    </div>
                    <section className="article_section">
                        <div className="article_separator" />
                        <p>For partnership information, please reach out to <a href="mailto:partners@nextbeat.co">partners@nextbeat.co</a>.</p> 
                    </section>
                </div>
            </div>
        )
    }
}

export default Brands;
import * as React from 'react'
import { Link } from 'react-router'

class Moderation extends React.Component {
    render() {
        return (
            <div className="article">
                <div className='article_header'>
                    <div className='article_header_content'>
                        <span className='article_title'>
                            Moderation
                        </span>
                    </div>
                </div>
                <div className="article_content">
                    <div className="article_main">
                        <section className="article_section">
                            <p>Welcome, new mod! Here’s a quick primer on how you can help keep Nextbeat rooms safe and civil.</p>
                        </section>
                    </div>
                </div>
            </div>
        )
    }
}

export default Moderation;
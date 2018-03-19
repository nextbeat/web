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
            <div className={`article creators-${platform}`}>
                <div className='article_header'>
                    <div className='article_header_content'>
                        <div className='article_icon_container'>
                            <div className="article_icon" />
                        </div>
                        <span className='article_title'>
                            { title }
                        </span>
                    </div>
                </div>
                <div className="article_content">
                    { children }
                    <section className="article_section">
                        <div className="article_separator" />
                        <p>Want to know more? We're happy to answer your questions — you can reach us at <a href="mailto:creators@nextbeat.co">creators@nextbeat.co</a>.</p> 
                    </section>
                </div>
            </div>
        )
    }
}

export default Creator;
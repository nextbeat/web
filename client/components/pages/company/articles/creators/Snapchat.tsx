import * as React from 'react'
import { Link } from 'react-router'
import Creator from './Creator'

class Snapchat extends React.Component {
    render() {
        return (
            <Creator platform="snapchat" title="Snapchat Stories">
                <div className="article_main">
                    <section className="article_section">
                        <h2>Why use Nextbeat?</h2>
                        <p>To get paid for work you’re already doing! You’re already producing short-form, unedited content that your audience loves -- why not get compensated for it?</p>
                        <p>Nextbeat also takes your community engagement to the next level with real-time audience interaction. By chatting with your viewers and taking their requests, you can build deeper connections with your fans.</p>
                        <aside>We believe that creators should always be compensated for their work, so Nextbeat guarantees transparent compensation rates.</aside>
                    </section>
                    <section className="article_section">
                        <h2>How does it work?</h2>
                        <p>Nextbeat pays you for spontaneous, unedited video content. Open a Nextbeat room to share a series of short, unedited videos with your audience in real time, engaging them in the chat and fulfilling requests with concise video updates.</p>
                    </section>
                </div>
            </Creator>
        )
    }
}

export default Snapchat;
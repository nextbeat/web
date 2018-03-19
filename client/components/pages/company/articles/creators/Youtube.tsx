import * as React from 'react'
import { Link } from 'react-router'
import Creator from './Creator'

class Youtube extends React.Component {
    render() {
        return (
            <Creator platform="youtube" title="YouTube Creators">
                <div className="article_main">
                    <section className="article_section">
                        <h2>Why use Nextbeat?</h2>
                        <p>You don’t need to pour hours of editing into a video to pick up a paycheck. Nextbeat’s live-update format requires no production work, but each post is tight and focused enough to hold audience attention and retain rewatch value.</p> 
                        <p>Nextbeat rooms also help you develop the deeper engagement that comes from direct audience interaction, without the camera fatigue that goes hand-in-hand with longer-form live streaming.</p>
                        <aside>We believe that creators should always be compensated for their work, so Nextbeat guarantees transparent compensation rates.</aside>
                    </section>
                    <section className="article_section">
                        <h2>How does it work?</h2>
                        <p>Nextbeat is a low-maintenance alternative to more intensively produced video. Open a Nextbeat room to share a series of short, unedited videos with your audience in real time, engaging them in the chat and fulfilling requests with concise video updates.</p>
                    </section>
                </div>
            </Creator>
        )
    }
}

export default Youtube;
import * as React from 'react'
import { Link } from 'react-router'
import Creator from './Creator'

class Twitch extends React.Component {
    render() {
        return (
            <Creator platform="twitch" title="Twitch & Livestream">
                <div className="creators_main">
                    <section className="creators_section">
                        <h2>Why use Nextbeat?</h2>
                        <p>Because Nextbeat posts are recorded and uploaded (rather than streamed live), you can create content outside the bounds of your network connectivity without losing the intimacy of audience interaction.</p>
                        <p>Nextbeat also helps you develop a portfolio of content that builds profit over time. After you close a room, each video post will still be accessible — think of it as the highlight reel of a stream, easily navigable with no editing required — and Nextbeat videos are short and punchy enough to retain their rewatch value.</p>
                        <aside>We believe that creators should always be compensated for their work, so Nextbeat guarantees transparent compensation rates.</aside>
                    </section>
                    <section className="creators_section">
                        <h2>How does it work?</h2>
                        <p>Nextbeat is an interactive vlogging platform which helps streamers to make low-maintenance real-time content at home or on the go. Open a Nextbeat room to share a series of short, unedited videos with your audience in real time, engaging them in the chat and fulfilling requests with concise video updates.</p>
                    </section>
                </div>
            </Creator>
        )
    }
}

export default Twitch;
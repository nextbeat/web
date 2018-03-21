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
                        <section className="article_section">
                            <div className="article_separator" />
                            <h2>Banning from a room</h2>
                            <p>By typing <span className="article_command">/roomban [username]</span> in the chat, you can ban a user from posting in the chat for the course of the presently open room. Times when you’ll want to use this:</p>
                            <ul>
                                <li>First offenders — users whose behavior has never been an issue before.</li>
                                <li>Humor &ldquo;in poor taste&rdquo; — jokes which make fun of others, mean comments which continue after the commenter is asked to stop, etc.</li>
                                <li>Disruption of the chat — trolls or spammers who are deliberately trying to &ldquo;take over&rdquo; the chat by flooding it with spam.</li>
                            </ul>
                            <p>To remove the ban, type <span className="article_command">/unroomban [username]</span></p>
                        </section>
                        <section className="article_section">
                            <h2>Permabanning</h2>
                            <p>By typing <span className="article_command">/ban [username]</span> in the chat, you can permanently ban a user from posting in all of the creator’s rooms. Times when you’ll want to use this:</p>
                            <ul>
                                <li>Sexual harassment is <strong>never</strong> okay on Nextbeat. Offenders who are making sexually inappropriate or hostile remarks should be permanently removed from the chat.</li>
                                <li>Nextbeat has a zero tolerance policy on racism, misogyny, homophobia, transphobia, or otherwise intolerance. Users whose comments reveal racial, gendered or sexual prejudice should be permanently removed from the chat.</li>
                                <li>Repeat offenders who consistently make hurtful comments or offensive jokes (even after repeatedly being asked to stop and being penalized with a temporary ban) should be permanently banned.</li>
                            </ul>
                            <p>To remove the ban, type <span className="article_command">/unban [username]</span></p>
                        </section>
                    </div>
                </div>
            </div>
        )
    }
}

export default Moderation;
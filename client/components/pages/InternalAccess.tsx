import * as React from 'react'
import * as fetch from 'isomorphic-fetch'
import { browserHistory } from 'react-router'

import Logo from '@components/shared/Logo'

interface State {
    error: boolean
}

class InternalAccess extends React.Component<{}, State> {

    private _password: HTMLInputElement

    constructor(props: {}) {
        super(props);

        this.submit = this.submit.bind(this)

        this.state = {
            error: false
        }
    }

    componentDidMount() {
        this._password.focus();
    }

    submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        let self = this;
        fetch('/internal/login', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 'password': this._password.value }),
            credentials: 'same-origin'
        })
        .then(res => {
            self.setState({
                error: !res.ok
            })
            if (res.ok) {
                browserHistory.push('/')
            }
        })
    }

    render() {
        return (
            <div className="internal-access">
                <div className="internal-access_form">
                    <div className="internal-access_logo">
                        <Logo />
                        <div className="internal-access_environment">
                            DEV
                        </div>
                    </div>
                    <div className="internal-access_description">
                        For internal eyes only.
                    </div>
                    <form onSubmit={this.submit}>
                        <input className="internal-access_password" type="password" name="password" ref={(c) => { if (c) { this._password = c } }} placeholder="Enter secret passphrase." />
                        <input className="btn internal-access_submit" type="submit" value="Access" />
                    </form> 
                    {this.state.error && <div className="internal-access_error">Incorrect passphrase.</div>}
                </div>
            </div>
        )
    }
}

export default InternalAccess;
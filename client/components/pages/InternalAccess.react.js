import React from 'react'

class InternalAccess extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <form action="/internal-login" method="post">
                    <input type="password" name="password" />
                    <input type="text" name="username" value="foo" />
                    <input type="submit" value="Access" />
                </form> 
            </div>
        )
    }
}

export default InternalAccess;
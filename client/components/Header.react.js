import React from 'react';

class Header extends React.Component {

    constructor(props) {
        super(props);
    }

    handleClick(e) {
        e.preventDefault();
        $('#login').toggle();
    }

    render() {
        const { user } = this.props;
        return (
            <section id="header">
                <span className="logo">sodosopa</span>
                {user
                    ? <span className="right">{user.get('username')}</span>
                    : <a className="right" onClick={this.handleClick} href="#">login</a>}
                <div id="login">
                    <form action="/login" method="post">
                        <div>
                            <label>Username: </label>
                            <input type="text" name="username"/>
                        </div>
                        <div>
                            <label>Password: </label>
                            <input type="password" name="password"/>
                        </div>
                        <div>
                            <input type="submit" value="Log In"/>
                        </div>
                    </form>
                </div>
            </section>
        );
    }
    
}

export default Header;

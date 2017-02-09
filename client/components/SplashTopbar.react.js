import React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import SmallLogo from './shared/SmallLogo.react'
import Logo from './shared/Logo.react'
import Icon from './shared/Icon.react'

import { promptModal, expandSplashTopbar, collapseSplashTopbar } from '../actions'
import { App } from '../models'

class SplashTopbar extends React.Component {

    constructor(props) {
        super(props)

        this.handleScroll = this.handleScroll.bind(this)
        this.handleLoginClick = this.handleLoginClick.bind(this)
        this.handleSignupClick = this.handleSignupClick.bind(this)
        this.handleSearchKeyPress = this.handleSearchKeyPress.bind(this)

        this.state = {
            collapsed: false
        }
    }

    componentDidMount() {
        $('.content').on('scroll', this.handleScroll)
        $('.content').on('touchmove', this.handleScroll)
        this.handleScroll()
    }

    componentWillUnmount() {
        $('.content').off('scroll', this.handleScroll)
        $('.content').off('touchmove', this.handleScroll)
    }


    // Events

    handleScroll() {
        let scrollTop = $('.content').scrollTop()
        const { splashTopbarCollapsed, dispatch } = this.props
        if (scrollTop > 0 && !splashTopbarCollapsed) {
            dispatch(collapseSplashTopbar())
        } else if (scrollTop <= 0 && splashTopbarCollapsed) {
            dispatch(expandSplashTopbar())
        }
    }

    handleLoginClick(e) {
        e.preventDefault();
        this.props.dispatch(promptModal('login'));
    }

    handleSignupClick(e) {
        e.preventDefault();
        this.props.dispatch(promptModal('signup'));
    }

    handleSearchKeyPress(e) {
        if (e.charCode === 13) { // enter
            const query = findDOMNode(this.refs.search_bar).value;
            if (query && query.length > 0) {
                this.context.router.push({
                    pathname: '/search',
                    query: { q: query }
                })
                findDOMNode(this.refs.search_bar).value = '';
            }
        }
    }


    // Render

    render() {
        const { splashTopbarCollapsed } = this.props
        return (
            <div className={`splash-topbar ${splashTopbarCollapsed ? 'collapsed' : ''}`}>
                <div className="splash-topbar_inner">
                    <div className="splash-topbar_background">
                        <SmallLogo type="splash-topbar" />
                    </div>
                    <div className="splash-topbar_search-container">
                        <div className="splash-topbar_search">
                            <input className="splash-topbar_search-bar" type="text" placeholder="Search" ref="search_bar" onKeyPress={this.handleSearchKeyPress} /><Icon type="search" />
                        </div>
                        <Link className="splash-topbar_search-icon" to="/search"><Icon type="search" /></Link>
                    </div>
                    <div className="splash-topbar_header">
                        <Logo type="splash-topbar" />
                        <div className="splash-topbar_right">
                            <a className="splash-topbar_login splash-topbar_btn" onClick={this.handleLoginClick}>Log In</a>
                            <a className="splash-topbar_signup splash-topbar_btn" onClick={this.handleSignupClick}>Sign Up</a>
                        </div>
                    </div>
                    <div className="splash-topbar_text">
                        Do anything with an audience.
                    </div>
                </div>

            </div>
        )
    }
}

function mapStateToProps(state) {
    let app = new App(state) 
    return {
        splashTopbarCollapsed: !!app.get('splashTopbarCollapsed')
    }
}

SplashTopbar.contextTypes = {
    router: React.PropTypes.object.isRequired
}

export default connect(mapStateToProps)(SplashTopbar);
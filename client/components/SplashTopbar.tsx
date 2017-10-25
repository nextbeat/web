import * as PropTypes from 'prop-types'
import * as React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import SmallLogo from '@components/shared/SmallLogo'
import Logo from '@components/shared/Logo'
import Icon from '@components/shared/Icon'

import { promptModal, expandSplashTopbar, collapseSplashTopbar } from '@actions/app'
import App from '@models/state/app'
import { State, DispatchProps } from '@types'

interface Props {
    isSplashTopbarCollapsed: boolean
}

class SplashTopbar extends React.Component<Props & DispatchProps> {

    static contextTypes = {
        router: PropTypes.object.isRequired
    }

    private _searchBar: HTMLInputElement

    constructor(props: Props & DispatchProps) {
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
        let scrollTop = $('.content').scrollTop() as number
        const { isSplashTopbarCollapsed, dispatch } = this.props
        if (scrollTop > 0 && !isSplashTopbarCollapsed) {
            dispatch(collapseSplashTopbar())
        } else if (scrollTop <= 0 && isSplashTopbarCollapsed) {
            dispatch(expandSplashTopbar())
        }
    }

    handleLoginClick(e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        this.props.dispatch(promptModal('login'));
    }

    handleSignupClick(e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        this.props.dispatch(promptModal('signup'));
    }

    handleSearchKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.charCode === 13) { // enter
            const query = this._searchBar.value
            if (query && query.length > 0) {
                this.context.router.push({
                    pathname: '/search',
                    query: { q: query }
                })
                this._searchBar.value = '';
            }
        }
    }


    // Render

    render() {
        const { isSplashTopbarCollapsed } = this.props
        return (
            <div className={`splash-topbar ${isSplashTopbarCollapsed ? 'collapsed' : ''}`}>
                <div className="splash-topbar_inner">
                    <div className="splash-topbar_background">
                        <SmallLogo type="splash-topbar" />
                    </div>
                    <div className="splash-topbar_search-container">
                        <div className="splash-topbar_search">
                            <input className="splash-topbar_search-bar" type="text" placeholder="Search" ref={(c) => { if (c) { this._searchBar = c } } } onKeyPress={this.handleSearchKeyPress} /><Icon type="search" />
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

function mapStateToProps(state: State): Props {
    return {
        isSplashTopbarCollapsed: !!App.get(state, 'splashTopbarCollapsed')
    }
}

export default connect(mapStateToProps)(SplashTopbar);
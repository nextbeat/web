import React from 'react'
import { connect } from 'react-redux' 

import { App } from '../../../models'
import Icon from '../../shared/Icon.react'
import { baseUrl } from '../../../utils'


class Share extends React.Component {

    constructor(props) {
        super(props)

        this.shareUrl = this.shareUrl.bind(this)

        this.toggleShareModal = this.toggleShareModal.bind(this)
        this.toggleIncludeIndex = this.toggleIncludeIndex.bind(this)

        this.renderFacebook = this.renderFacebook.bind(this)
        this.renderTwitter = this.renderTwitter.bind(this)

        this.state = {
            showShareModal: false,
            includeIndex: false,
        }
    }


    shareUrl(showIndex=true) {
        const { stack } = this.props
        const { includeIndex } = this.state
        const indexPath = (includeIndex && showIndex) ? '/'+(stack.indexOfSelectedMediaItem()+1) : ''

        return `${baseUrl()}/r/${stack.get('hid')}${indexPath}`
    }

    // Component lifecycle

    componentWillUnmount() {
        $(document).off('.hideShareModal');
    }


    // Actions

    toggleShareModal() {
        const { showShareModal } = this.state 
        let $share = $('.player_share_wrapper');

        if (!showShareModal) {
            this.setState({ showShareModal: true })
            // add event which detects clicks outside of dropdown to close it
            $(document).on('mouseup.hideShareModal', e => {
                // check that target isn't share wrapper or one of its descendants
                if (!($share.is(e.target) || $share.has(e.target).length > 0)) {
                    $(document).off('.hideShareModal');
                    this.setState({ showShareModal: false })
                }
            });
        } else {
            // unbind event when dropdown is hidden
            $(document).off('.hideShareModal');
            this.setState({ showShareModal: false })
        }
    }

    toggleIncludeIndex() {
        const { includeIndex } = this.state
        this.setState({
            includeIndex: !includeIndex
        })
    }


    // Render

    renderFacebook() {
        const { app } = this.props
        const facebookAppId = app.get('facebookAppId')
        const url = encodeURIComponent(this.shareUrl(false))
        return <iframe className="share_social-button share_facebook-button" src={`https://www.facebook.com/plugins/share_button.php?href=${url}&layout=button&mobile_iframe=true&appId=${facebookAppId}&width=58&height=20`} width="58" height="20" style={{border: "none", overflow: "hidden"}} scrolling="no" frameBorder="0" allowTransparency="true"></iframe>
    }

    renderTwitter() {
        const { stack } = this.props

        const text = encodeURIComponent(stack.status() === "closed" ? 'Check out my room on Nextbeat!' : 'Posting updates to my room on Nextbeat. Check it out!')
        const url = encodeURIComponent(this.shareUrl(false))
        return <iframe className="share_social-button share_twitter-button" src={`https://platform.twitter.com/widgets/tweet_button.html?url=${url}&text=${text}&via=nextbeatTv`} width="130" height="20" scrolling="no" title="Twitter Tweet Button" style={{border: "none", overflow: "hidden"}}></iframe>
    }

    render() {
        const { showShareModal, includeIndex } = this.state
        return (
            <div className="player_share_wrapper">
                <div className="player_button-share" onClick={this.toggleShareModal}><Icon type="share" /><span>Share</span></div>
                <div className="player_share_modal" style={{ display: (showShareModal ? "block" : "none") }}>
                    <div className="share_social">
                        {this.renderFacebook()}{this.renderTwitter()}
                    </div>
                    <div className="share_field">
                        <label>Room Link</label>
                        <div className="share_include-post">
                            <input type="checkbox" onClick={this.toggleIncludeIndex} checked={includeIndex} /><label>Include post number</label>
                        </div>
                        <input type="text" readOnly={true} value={this.shareUrl()} onFocus={ e => $(e.target).select() } />
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        app: new App(state)
    }
}

export default connect(mapStateToProps)(Share);

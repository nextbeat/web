import React from 'react'

import Icon from '../../shared/Icon.react'

class ImageControls extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        const { shouldDisplayControls, isFullScreen, fullScreen } = this.props

        const displayControlsClass = shouldDisplayControls ? "display-controls" : "";
        const fullScreenIcon = isFullScreen ? "fullscreen-exit" : "fullscreen";

        return (
            <div className={`video_bottom ${displayControlsClass}`}>
                <div className="video_gradient-bottom"></div>
                <div className="video_controls" id="video_controls">
                    <div className="video_controls-right">
                        <a className="video_control video_control-fullscreen" onClick={fullScreen}><Icon type={fullScreenIcon} /></a>
                    </div>
                </div>
            </div>
        );
    }

}

ImageControls.propTypes = {
    shouldDisplayControls: React.PropTypes.bool,
    isFullScreen: React.PropTypes.bool,
    fullScreen: React.PropTypes.func
}

export default ImageControls

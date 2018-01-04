import * as React from 'react'
import Icon from '@components/shared/Icon'

interface Props {
    shouldDisplayControls: boolean
    isFullScreen: boolean
    isContinuousPlayEnabled: boolean
    
    fullScreen: () => void
    toggleContinuousPlay: () => void
}

class ImageControls extends React.Component<Props> {

    constructor(props: Props) {
        super(props);
    }

    render() {

        const { shouldDisplayControls, isFullScreen, isContinuousPlayEnabled,
                fullScreen, toggleContinuousPlay } = this.props

        const displayControlsClass = shouldDisplayControls ? "display-controls" : "";
        const fullScreenIcon = isFullScreen ? "fullscreen-exit" : "fullscreen";
        const autoplaySelectedClass = isContinuousPlayEnabled ? "player_control-autoplay-selected" : "";

        return (
            <div className={`player_bottom ${displayControlsClass}`}>
                <div className="player_gradient-bottom"></div>
                <div className="player_controls" id="player_controls">
                    <div className="player_controls-right">
                        <a className="player_control player_control-fullscreen" onClick={fullScreen}><Icon type={fullScreenIcon} /></a>
                        <a className={`player_control player_control-autoplay ${autoplaySelectedClass}`} onClick={toggleContinuousPlay}><Icon type="autoplay" /></a>
                    </div>
                </div>
            </div>
        );
    }

}

export default ImageControls

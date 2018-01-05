import * as React from 'react'
import Icon from '@components/shared/Icon'

interface Props {
    shouldDisplayControls: boolean
    isFullScreen: boolean
    isContinuousPlayEnabled: boolean
    continuousPlayTimeLeft: number
    
    fullScreen: () => void
    toggleContinuousPlay: () => void
}

class ImageControls extends React.Component<Props> {

    constructor(props: Props) {
        super(props);
    }

    render() {

        const { shouldDisplayControls, isFullScreen, isContinuousPlayEnabled,
                fullScreen, toggleContinuousPlay, continuousPlayTimeLeft } = this.props

        const displayControlsClass = shouldDisplayControls ? "display-controls" : "";
        const fullScreenIcon = isFullScreen ? "fullscreen-exit" : "fullscreen";
        const autoplaySelectedClass = isContinuousPlayEnabled ? "player_control-autoplay-selected" : "";
        const timeLeft = Math.ceil(continuousPlayTimeLeft)

        return (
            <div className={`player_bottom ${displayControlsClass}`}>
                <div className="player_gradient-bottom"></div>
                <div className="player_controls" id="player_controls">
                    <div className="player_controls-right">
                        <a className="player_control player_control-fullscreen" onClick={fullScreen}>
                            <Icon type={fullScreenIcon} />
                            <div className="player_tooltip">Fullscreen</div>
                        </a>
                        <a className={`player_control player_control-autoplay ${autoplaySelectedClass}`} onClick={toggleContinuousPlay}>
                            <Icon type="autoplay" />
                            <div className="player_tooltip">Autoplay</div>
                        </a>
                        { isContinuousPlayEnabled && <div className="player_control player_control-autoplay-timer">{timeLeft}</div> }
                    </div>
                </div>
            </div>
        );
    }

}

export default ImageControls

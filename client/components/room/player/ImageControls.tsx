import * as React from 'react'
import Icon from '@components/shared/Icon'

interface Props {
    shouldDisplayControls: boolean
    isFullScreen: boolean
    isContinuousPlayEnabled: boolean
    shouldDisplayContinuousPlayCountdown: boolean
    continuousPlayTimeLeft: number
    continuousPlayDuration: number
    
    fullScreen: () => void
}

class ImageControls extends React.Component<Props> {

    constructor(props: Props) {
        super(props);
    }

    render() {

        const { shouldDisplayControls, isFullScreen, isContinuousPlayEnabled, fullScreen, 
                continuousPlayTimeLeft, continuousPlayDuration, shouldDisplayContinuousPlayCountdown } = this.props

        const displayControlsClass = shouldDisplayControls ? "display-controls-image" : "";
        const fullScreenIcon = isFullScreen ? "fullscreen-exit" : "fullscreen";
        const autoplaySelectedClass = isContinuousPlayEnabled ? "player_control-autoplay-selected" : "";
        const timeLeft = Math.ceil(continuousPlayTimeLeft) || 0

        return (
            <div className={`player_bottom player_bottom-image not-scrubbable ${displayControlsClass}`}>
                <div className="player_gradient-bottom"></div>
                { isContinuousPlayEnabled && shouldDisplayContinuousPlayCountdown &&
                <div className="player_progress-bar-container">
                    <div className="player_progress-bar-padding"></div>
                    <div className="player_progress-bar">
                        <div className="player_progress-play" style={{ transform: `scaleX(${ 1-continuousPlayTimeLeft/continuousPlayDuration })` }}></div>
                        <div className="player_progress-buffer" style={{ transform: `scaleX(${ 1-continuousPlayTimeLeft/continuousPlayDuration })` }}></div>
                    </div>
                </div>
                }
                <div className="player_controls" id="player_controls">
                    <div className="player_controls-right">
                        <a className="player_control player_control-fullscreen" onClick={fullScreen}>
                            <Icon type={fullScreenIcon} />
                            <div className="player_tooltip">Fullscreen</div>
                        </a>
                        { isContinuousPlayEnabled && shouldDisplayContinuousPlayCountdown && <div className="player_control player_control-autoplay-timer">{timeLeft}</div> }
                    </div>
                </div>
            </div>
        );
    }

}

export default ImageControls

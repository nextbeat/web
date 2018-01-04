import * as React from 'react'
import { connect } from 'react-redux'
import { Map } from 'immutable'

import Decoration from './Decoration'
import ImageControls from './ImageControls'

import { setContinuousPlay } from '@actions/room'
import App from '@models/state/app'
import Room from '@models/state/room'
import { toggleFullScreen, isFullScreen } from '@utils'
import { State, DispatchProps } from '@types'

interface OwnProps {
    image: State
    containerWidth: number
    containerHeight: number
    hideControls?: boolean
    decoration?: State
    roomId?: number
}

interface ConnectProps {
    shouldForceRotation: boolean
    isContinuousPlayEnabled: boolean
}

type Props = OwnProps & ConnectProps & DispatchProps

interface ImageState {
    width: number
    height: number
    scale: number
    shouldDisplayControls: boolean
    isFullScreen: boolean
}

class Image extends React.Component<Props, ImageState> {

    static defaultProps: Partial<Props> = {
        hideControls: false
    }

    constructor(props: Props) {
        super(props)

        this.fullScreen = this.fullScreen.bind(this)
        this.toggleContinuousPlay = this.toggleContinuousPlay.bind(this)

        this.calculateDimensions = this.calculateDimensions.bind(this)
        this.handleFullScreenChange = this.handleFullScreenChange.bind(this)
        this.handleOnMouseOver = this.handleOnMouseOver.bind(this)
        this.handleOnMouseOut = this.handleOnMouseOut.bind(this)

        this.imageStyle = this.imageStyle.bind(this)

        this.state = {
            width: 0,
            height: 0,
            scale: 1,
            shouldDisplayControls: false,
            isFullScreen: false
        }
    }


    // Component lifecycle

    componentDidMount() {
        const { image } = this.props

        if (image.get('type') === 'objectURL') {
            $('#player_photo').one('load', () => {
                URL.revokeObjectURL(image.get('url'))
            })
        }

        $(window).on('fullscreenchange webkitfullscreenchange mozfullscreenchange msfullscreenchange', this.handleFullScreenChange)

        this.calculateDimensions(this.props.image)
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.image !== this.props.image 
            || prevProps.containerHeight !== this.props.containerHeight 
            || prevProps.containerWidth !== this.props.containerWidth) {
            this.calculateDimensions(this.props.image)
        }
    }

    componentWillUnmount() {
        $(window).off('fullscreenchange webkitfullscreenchange mozfullscreenchange msfullscreenchange', this.handleFullScreenChange)
    }

    // Actions

    fullScreen() {
        toggleFullScreen(document.getElementById('player_media-inner'))
    }

    toggleContinuousPlay() {
        const { dispatch, roomId, isContinuousPlayEnabled } = this.props
        if (!roomId) {
            return
        }

        dispatch(setContinuousPlay(roomId, !isContinuousPlayEnabled))
    }

    // Events

    handleOnMouseOver() {
        this.setState({
            shouldDisplayControls: true
        })
    }

    handleOnMouseOut() {
        this.setState({
            shouldDisplayControls: false
        })
    }

    handleFullScreenChange() {
        this.setState({
            isFullScreen: isFullScreen()
        })
    }

    calculateDimensions(image: State) {
        const { containerWidth, containerHeight } = this.props
        const imageRatio = image.get('width')/image.get('height')
        const containerRatio = containerWidth/containerHeight

        if (imageRatio > containerRatio) {
            this.setState({
                width: containerWidth,
                height: Math.floor(containerWidth/imageRatio)
            })
        } else {
            this.setState({
                width: Math.floor(containerHeight*imageRatio),
                height: containerHeight
            })
        }

        this.setState({
            scale: containerRatio
        });

    }

    // Render

    imageStyle() {
        const { scale, width, height } = this.state
        const { image, shouldForceRotation } = this.props 

        let style: any = {
            width: `${width}px`,
            height: `${height}px`
        }
        
        // If the image has orientation metadata, we need to rotate the image back into 
        // its proper orientation and scale it to fit into the container frame
        if (shouldForceRotation) {
            const orientation = parseInt(image.get('orientation', 0))
            if (orientation === 90) {
                style.transform = `rotate(90deg) scale(${scale})`
            } else if (orientation === 180) {
                style.transform = `rotate(180deg)`
            } else if (orientation === 270) {
                style.transform = `rotate(-90deg) scale(${scale})`
            }
        }

        return style;
    }

    captionStyle(state: ImageState) {
        const { width, height } = state 
        return {
            width: `${width}px`, 
            height: `${height}px`
        }
    }

    render() {
        let { image, decoration, hideControls, isContinuousPlayEnabled } = this.props
        let { width, height, shouldDisplayControls, isFullScreen } = this.state

        const imageStyle = {
            display: image.isEmpty() ? 'none' : 'block'
        }

        const photoContainerEvents = {
            onMouseOver: this.handleOnMouseOver,
            onMouseOut: this.handleOnMouseOut
        }

        const imageControlsProps = {
            fullScreen: this.fullScreen,
            toggleContinuousPlay: this.toggleContinuousPlay,
            isFullScreen,
            isContinuousPlayEnabled,
            shouldDisplayControls
        }

        /* The img element has a key attribute so that React
         * is forced to re-render the element when the image
         * is changed. Without it, only the src attribute
         * is updated, and some browsers will display the original
         * image until the new one is loaded, which can appear
         * sluggish for the end user.
         */
        return (
            <div className="player_photo-container" style={imageStyle} {...photoContainerEvents}>
                <img key={image.get('url')} src={image.get('url')} id="player_photo" className="player_photo" style={this.imageStyle()} />
                { decoration && <Decoration decoration={decoration} width={width} height={height} /> }
                { !hideControls && <ImageControls {...imageControlsProps} /> }
            </div>
        )
    }
}

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {
    return {
        shouldForceRotation: App.get(state, 'browser') === 'Chrome' && parseInt(App.get(state, 'version')) === 52,
        isContinuousPlayEnabled: !!ownProps.roomId && Room.get(state, ownProps.roomId, 'isContinuousPlayEnabled', false),
    }
}

export default connect(mapStateToProps)(Image)


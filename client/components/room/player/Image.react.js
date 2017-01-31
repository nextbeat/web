import React from 'react'
import { connect } from 'react-redux'
import Promise from 'bluebird'
import { Map } from 'immutable'

import Decoration from './Decoration.react'
import ImageControls from './ImageControls.react'
import { App } from '../../../models'
import { toggleFullScreen, isFullScreen } from '../../../utils'

class Image extends React.Component {

    constructor(props) {
        super(props)

        this.shouldForceRotation = this.shouldForceRotation.bind(this)

        this.fullScreen = this.fullScreen.bind(this)

        this.resize = this.resize.bind(this)
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

        $(window).on('resize.photo', this.resize)
        setTimeout(() => {
            this.resize(image)
        })

        if (image.get('type') === 'objectURL') {
            $('#player_photo').one('load', () => {
                URL.revokeObjectURL(image.get('url'))
            })
        }

        $(window).on('fullscreenchange webkitfullscreenchange mozfullscreenchange msfullscreenchange', this.handleFullScreenChange)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.image !== this.props.image) {
            this.resize(nextProps.image);
        }
    }

    componentWillUnmount() {
        $(window).off('resize.photo')
        $(window).off('fullscreenchange webkitfullscreenchange mozfullscreenchange msfullscreenchange', this.handleFullScreenChange)
    }


    // Queries

    shouldForceRotation() {
        const { app } = this.props;
        return app.get('browser') === 'Chrome' && parseInt(app.get('version')) === 52;
    }

    // Actions

    fullScreen() {
        toggleFullScreen(document.getElementById('player_media-inner'))
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

    resize(image) {
        if (!image || !Map.isMap(image)) {
            image = this.props.image
        }

        const containerWidth = $('.player_media-inner').width()
        const containerHeight = $('.player_media-inner').height()
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
        const { image } = this.props 

        let style = {
            width: `${width}px`,
            height: `${height}px`
        }
        
        // If the image has orientation metadata, we need to rotate the image back into 
        // its proper orientation and scale it to fit into the container frame
        if (this.shouldForceRotation()) {
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

    captionStyle(state) {
        const { width, height } = state 
        return {
            width: `${width}px`, 
            height: `${height}px`
        }
    }

    render() {
        let { image, decoration, hideControls } = this.props
        let { width, height, shouldDisplayControls, isFullScreen } = this.state

        const photoContainerEvents = {
            onMouseOver: this.handleOnMouseOver,
            onMouseOut: this.handleOnMouseOut
        }

        const imageControlsProps = {
            fullScreen: this.fullScreen,
            isFullScreen,
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
            <div className="player_photo-container" {...photoContainerEvents}>
                <img key={image.get('url')} src={image.get('url')} id="player_photo" className="player_photo" style={this.imageStyle()} />
                { decoration && <Decoration decoration={decoration} width={width} height={height} /> }
                { !hideControls && <ImageControls {...imageControlsProps} /> }
            </div>
        )
    }
}

Image.propTypes = {
    image: React.PropTypes.object.isRequired,
    containerWidth: React.PropTypes.number.isRequired,
    containerHeight: React.PropTypes.number.isRequired,
    
    hideControls: React.PropTypes.bool,
    decoration: React.PropTypes.object,
}

Image.defaultProps = {
    hideControls: false
}

function mapStateToProps(state) {
    return {
        app: new App(state)
    }
}

export default connect(mapStateToProps)(Image)


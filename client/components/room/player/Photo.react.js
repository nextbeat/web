import React from 'react'
import Promise from 'bluebird'
import { Map } from 'immutable'

import Decoration from './Decoration.react'

class Photo extends React.Component {

    constructor(props) {
        super(props)

        this.resize = this.resize.bind(this)

        this.state = {
            width: 0,
            height: 0,
            scale: 1
        }
    }

    // Component lifecycle

    componentDidMount() {
        const { image } = this.props
        $(window).on('resize.photo', this.resize.bind(this, image))
        this.resize(image)

        if (image.get('type') === 'objectURL') {
            $('#player_photo').one('load', () => {
                URL.revokeObjectURL(image.get('url'))
            })
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.image !== this.props.image) {
            $('#player_photo').one('load', () => {
                this.resize(nextProps.image);
            })
        }
    }

    componentWillUnmount() {
        $(window).off('resize.photo')
    }

    // Events

    resize(image) {
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

    imageStyle(image, state) {
        const { scale, width, height } = this.state

        let style = {
            width: `${width}px`,
            height: `${height}px`
        }
        
        // If the image has orientation metadata, we need to rotate the image back into 
        // its proper orientation and scale it to fit into the container frame
        const orientation = parseInt(image.get('orientation', 0))
        if (orientation === 90) {
            style.transform = `rotate(90deg) scale(${scale})`
        } else if (orientation === 180) {
            style.transform = `rotate(180deg)`
        } else if (orientation === 270) {
            style.transform = `rotate(-90deg) scale(${scale})`
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
        let { image, decoration } = this.props

        return (
            <div className="player_photo-container">
                <img src={image.get('url')} id="player_photo" className="player_photo" style={this.imageStyle(image, this.state)} />
                { decoration && 
                    <div className="player_decoration-container" style={this.captionStyle(this.state)}>
                        <Decoration decoration={decoration} />
                    </div>
                }
            </div>
        )
    }
}

export default Photo


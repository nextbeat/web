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
        window.addEventListener('resize', this.resize)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.image !== this.props.image) {
            this.resize();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize)
    }

    // Events

    resize() {
        const { image } = this.props
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
            style.transform = `rotate(-90deg) scale(${scale})`
        } else if (orientation === 180) {
            style.transform = `rotate(180deg)`
        } else if (orientation === 270) {
            style.transform = `rotate(90deg) scale(${scale})`
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
                <img src={image.get('url')} className="player_photo" style={this.imageStyle(image, this.state)} />
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


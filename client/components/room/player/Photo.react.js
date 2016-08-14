import React from 'react'
import Promise from 'bluebird'
import { Map } from 'immutable'

import Decoration from './Decoration.react'

class Photo extends React.Component {

    constructor(props) {
        super(props)

        this.resize = this.resize.bind(this)
        this.loadImage = this.loadImage.bind(this);

        this.state = {
            url: '',
            image: Map(),
            imageObject: new Image()
        }
    }

    // Component lifecycle

    componentDidMount() {
        const { imageObject } = this.state
        const { item } = this.props

        let image = item.image()
        image = image.update({
            width: parseFloat(image.get('width', 0)),
            height: parseFloat(image.get('height', 0))
        })
        this.setState({ image })

        // if width/height undefined or 0, we need to load the image into a JS Image object
        // (this is temporary!)
        if (image.get('width') === 0) {
            // for processed images
            imageObject.addEventListener('load', () => {
                this.setState({ url: this.props.item.get('url') })
                this.resize()
            })
        } 


        window.addEventListener('resize', this.resize)

        this.loadImage(this.props)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.item !== this.props.item) {
            this.loadImage(nextProps)
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize)
    }

    // Actions

    loadImage(props) {
        const { processed, item } = props
        this.setState({ url: '' })
        this.state.image.src = item.get('url')
    }

    // Events

    resize() {
        const { image } = this.state 
        const containerWidth = $('.player_media-inner').width()
        const containerHeight = $('.player_media-inner').height()
        const imageRatio = image.width/image.height
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

        const node = $(this._node)
        this.setState({
            scale: node.width()/node.height()
        })  
    }

    // Render

    imageStyle(image) {
        const scale = image.get('height') > 0 ? image.get('width')/image.get('height') : 1

        let style = { backgroundImage: `url(${image.get('url')}` }
        if (orientation === 90) {
            style.transform = `rotate(-90deg) scale(${scale})`
        } else if (orientation === 270) {
            style.transform = `rotate(90deg) scale(${scale})`
        }
        return style;
    }

    captionStyle(state) {
        const { orientation, width, height } = state 
        if (orientation === 6 || orientation === 8) {
            const containerWidth = $('.player_media-inner').width()
            const containerHeight = $('.player_media-inner').height()
            return {width: `${containerWidth}px`, height: `${containerHeight}px`}
        } else {
            return {width: `${width}px`, height: `${height}px`}
        }
    }

    render() {
        const { item, processed } = this.props
        const { url, orientation } = this.state

        let decoration = item.get('decoration')
        if (!processed && decoration && orientation > 0) {
            // WORK AROUND until we can include width and height in response to simplify things
            decoration = decoration.set('caption_offset', 0.5)
        }

        return (
            <div className="player_photo-container">
                <div ref={(c) => this._node = c} className="player_photo" style={this.imageStyle(this.state)} />
                {url.length > 0 && decoration && 
                    <div className="player_decoration-container" style={this.captionStyle(this.state)}>
                        <Decoration decoration={decoration} />
                    </div>
                }
            </div>
        )
    }
}

export default Photo


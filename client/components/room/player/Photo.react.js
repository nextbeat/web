import React from 'react'
import Promise from 'bluebird'

import Decoration from './Decoration.react'
import { getOrientationFromFile } from '../../../utils'

function getImageOrientation(url) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.onload = function(e) {
            if (this.status == 200) {
                // get binary data as a response
                var blob = this.response;
                getOrientationFromFile(blob, o => { resolve(o) })
            } else {
                reject();
            }
        };
        xhr.send();
    })
}

class Photo extends React.Component {

    constructor(props) {
        super(props)

        this.resize = this.resize.bind(this)
        this.loadImage = this.loadImage.bind(this);

        this.state = {
            url: '',
            image: new Image(),
            width: 0,
            height: 0,
            // unprocessed image display logic
            orientation: -1,
            scale: 1
        }
    }

    // Component lifecycle

    componentDidMount() {
        const { image } = this.state

        // for processed images
        image.addEventListener('load', () => {
            this.setState({ url: this.props.item.get('url') })
            this.resize()
        })
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
        if (processed) {
            // we are guaranteed a proper orientation, so we don't have to explicitly load the image blob to check
            this.setState({ url: '' })
            this.state.image.src = item.get('url')
        } else {
            getImageOrientation(item.get('url')).bind(this).then(function(o) {
                this.setState({
                    orientation: o
                })
                // load image once orientation is known
                this.state.image.src = item.get('url')
            })
        }
    }

    // Events

    resize() {
        const { processed } = this.props
        if (processed) {
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
        } else {
            const node = $(this._node)
            this.setState({
                scale: node.width()/node.height()
            })
        }    
    }

    // Render

    imageStyle(state) {
        const { orientation, scale } = state

        if (orientation === 8) {
            return { transform: `rotate(-90deg) scale(${scale})`}
        } else if (orientation === 6) {
            return { transform: `rotate(90deg) scale(${scale})` }
        } else {
            // orientation value is unsupported or undefined (i.e. image is processed)
            return {}
        }

    }

    containerStyle(state) {
        const { width, height } = state
        if (width > 0 && height > 0)  {
            return {height: `${height}px`, width: `${width}px`}
        } else {
            return {}
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
            <div className="player_photo-container" style={this.containerStyle(this.state)} >
                <img ref={(c) => this._node = c} className="player_photo" src={url} style={this.imageStyle(this.state)}/>
                {url.length > 0 && decoration && 
                    <Decoration decoration={decoration} />
                }
            </div>
        )
    }
}

export default Photo


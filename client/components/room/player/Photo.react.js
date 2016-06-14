import React from 'react'

import Decoration from './Decoration.react'

class Photo extends React.Component {

    constructor(props) {
        super(props)

        this.resize = this.resize.bind(this)

        this.state = {
            url: '',
            image: new Image(),
            width: 0,
            height: 0
        }
    }

    // Component lifecycle

    componentDidMount() {
        const { image } = this.state
        image.addEventListener('load', () => {
            this.setState({ url: this.props.item.get('url') })
            this.resize()
        })
        window.addEventListener('resize', this.resize)
        image.src = this.props.item.get('url')
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.item !== this.props.item) {
            this.setState({ url: '' })
            this.state.image.src = nextProps.item.get('url')
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize)
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
    }

    // Render

    render() {
        const { item } = this.props
        const { url, width, height } = this.state
        return (
            <div className="player_photo-container" style={{height: `${height}px`, width: `${width}px`}}>
                <img className="player_photo" src={url}/>
                {url.length > 0 && item.get('decoration') && <Decoration decoration={item.get('decoration')} />}
            </div>
        )
    }
}

export default Photo


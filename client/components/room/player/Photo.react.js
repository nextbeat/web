import React from 'react'

import Promise from 'bluebird'
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

        this.updateStateForURL = this.updateStateForURL.bind(this)
        this.handleResize = this.handleResize.bind(this)

        this.state = {
            loadedURL: '',
            orientation: -1,
            scale: 1
        }
    }

    componentDidMount() {
        const node = $(this._node)
        this.updateStateForURL(this.props.item.get('url'))
        $(window).on('resize.photo', this.handleResize.bind(this, node))
        this.handleResize(node);
    }

    componentWillUnmount() {
        $(window).off('resize.photo');
    }

    componentDidUpdate(prevProps) {
        if (prevProps.item.get('url') !== this.props.item.get('url')) {
            this.updateStateForURL(this.props.item.get('url'))
        }
    }

    handleResize(node) {
        this.setState({
            scale: node.width()/node.height()
        })
    }

    updateStateForURL(url) {
        getImageOrientation(url).bind(this).then(function(o) {
            this.setState({
                loadedURL: url,
                orientation: o
            })
        });
    }

    render() {
        const { loadedURL, orientation, scale } = this.state;

        // set rotate transform according to orientation
        let style = { backgroundImage: `url(${loadedURL})`}
        if (orientation === 8) {
            style.transform = `rotate(-90deg) scale(${scale})`
        } else if (orientation === 6) {
            style.transform = `rotate(90deg) scale(${scale})`
        }

        return <div className="player_photo" style={style} ref={(c) => this._node = c}></div>
    }
}

export default Photo


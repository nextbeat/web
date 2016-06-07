import React from 'react'

class Photo extends React.Component {

    render() {
        const { item } = this.props;
        return <div className="player_photo" style={{ backgroundImage: `url(${item.get('url')})`}}></div>
    }
}

export default Photo


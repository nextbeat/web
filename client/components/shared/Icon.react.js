import React from 'react'

const ICONS = {
    'share': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" ><path d="M36 32.17c-1.52 0-2.89.59-3.93 1.54L17.82 25.4c.11-.45.18-.92.18-1.4s-.07-.95-.18-1.4l14.1-8.23c1.07 1 2.5 1.62 4.08 1.62 3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6c0 .48.07.95.18 1.4l-14.1 8.23c-1.07-1-2.5-1.62-4.08-1.62-3.31 0-6 2.69-6 6s2.69 6 6 6c1.58 0 3.01-.62 4.08-1.62l14.25 8.31c-.1.42-.16.86-.16 1.31A5.83 5.83 0 1 0 36 32.17z"/></svg>
    , 'bookmark': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M34 6H14c-2.21 0-3.98 1.79-3.98 4L10 42l14-6 14 6V10a4 4 0 0 0-4-4z"/></svg>
    , 'bookmark-outline': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M34 6H14c-2.21 0-3.98 1.79-3.98 4L10 42l14-6 14 6V10a4 4 0 0 0-4-4zm0 30l-10-4.35L14 36V10h20v26z"/></svg>
    , 'chevron-right': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M20 12l-2.83 2.83L26.34 24l-9.17 9.17L20 36l12-12z"/></svg>
    , 'chevron-left': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M30.83 14.83L28 12 16 24l12 12 2.83-2.83L21.66 24z"/></svg>
    , 'person': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M24 24c4.42 0 8-3.59 8-8 0-4.42-3.58-8-8-8s-8 3.58-8 8c0 4.41 3.58 8 8 8zm0 4c-5.33 0-16 2.67-16 8v4h32v-4c0-5.33-10.67-8-16-8z"/></svg>
    , 'chat': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M40 4H8C5.79 4 4 5.79 4 8v36l8-8h28c2.21 0 4-1.79 4-4V8c0-2.21-1.79-4-4-4z"/></svg>
    , 'activity': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M40 26H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h34c1.1 0 2-.9 2-2V28c0-1.1-.9-2-2-2zm0-20H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h34c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>
    , 'menu': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M6 36h36v-4H6v4zm0-10h36v-4H6v4zm0-14v4h36v-4H6z"/></svg>
}

class Icon extends React.Component {

    renderSvg(type) {
        return ICONS[type] ? ICONS[type] : <svg></svg>
    }

    render() {
        const typeClass = `svg-icon-${this.props.type}`
        return <span className={`svg-icon ${typeClass}`}>{ this.renderSvg(this.props.type) }</span>;
    }
}

Icon.propTypes = {
    type: React.PropTypes.string.isRequired
}

export default Icon;

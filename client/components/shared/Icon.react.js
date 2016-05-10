import React from 'react'

const ICONS = {
      'activity': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M40 26H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h34c1.1 0 2-.9 2-2V28c0-1.1-.9-2-2-2zm0-20H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h34c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>
    , 'arrow-drop-down': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M14 20l10 10 10-10z"/></svg>
    , 'bookmark': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M34 6H14c-2.21 0-3.98 1.79-3.98 4L10 42l14-6 14 6V10a4 4 0 0 0-4-4z"/></svg>
    , 'bookmark-outline': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M34 6H14c-2.21 0-3.98 1.79-3.98 4L10 42l14-6 14 6V10a4 4 0 0 0-4-4zm0 30l-10-4.35L14 36V10h20v26z"/></svg>
    , 'chat': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M40 4H8C5.79 4 4 5.79 4 8v36l8-8h28c2.21 0 4-1.79 4-4V8c0-2.21-1.79-4-4-4z"/></svg>
    , 'chevron-left': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M30.83 14.83L28 12 16 24l12 12 2.83-2.83L21.66 24z"/></svg>
    , 'chevron-right': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M20 12l-2.83 2.83L26.34 24l-9.17 9.17L20 36l12-12z"/></svg>
    , 'fullscreen': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M14 28h-4v10h10v-4h-6v-6zm-4-8h4v-6h6v-4H10v10zm24 14h-6v4h10V28h-4v6zm-6-24v4h6v6h4V10H28z"/></svg>
    , 'menu': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M6 36h36v-4H6v4zm0-10h36v-4H6v4zm0-14v4h36v-4H6z"/></svg>
    , 'pause': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M12 38h8V10h-8v28zm16-28v28h8V10h-8z"/></svg>
    , 'person': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M24 24c4.42 0 8-3.59 8-8 0-4.42-3.58-8-8-8s-8 3.58-8 8c0 4.41 3.58 8 8 8zm0 4c-5.33 0-16 2.67-16 8v4h32v-4c0-5.33-10.67-8-16-8z"/></svg>
    , 'play': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M16 10v28l22-14z"/></svg>
    , 'sad-face': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M23.99 4C12.94 4 4 12.95 4 24s8.94 20 19.99 20S44 35.05 44 24 35.04 4 23.99 4zM24 40c-8.84 0-16-7.16-16-16S15.16 8 24 8s16 7.16 16 16-7.16 16-16 16zm8.36-24.49l-2.12 2.13-2.12-2.13L26 17.64l2.12 2.12L26 21.88 28.12 24l2.12-2.12L32.36 24l2.13-2.12-2.13-2.12 2.13-2.12zM15.64 24l2.12-2.12L19.88 24 22 21.88l-2.12-2.12L22 17.64l-2.12-2.13-2.12 2.13-2.12-2.13-2.13 2.13 2.13 2.12-2.13 2.12zM24 28c-4.66 0-8.62 2.92-10.22 7h20.44c-1.6-4.08-5.56-7-10.22-7z"/></svg>
    , 'search': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M31 28h-1.59l-.55-.55C30.82 25.18 32 22.23 32 19c0-7.18-5.82-13-13-13S6 11.82 6 19s5.82 13 13 13c3.23 0 6.18-1.18 8.45-3.13l.55.55V31l10 9.98L40.98 38 31 28zm-12 0c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9z"/></svg>
    , 'share': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" ><path d="M36 32.17c-1.52 0-2.89.59-3.93 1.54L17.82 25.4c.11-.45.18-.92.18-1.4s-.07-.95-.18-1.4l14.1-8.23c1.07 1 2.5 1.62 4.08 1.62 3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6c0 .48.07.95.18 1.4l-14.1 8.23c-1.07-1-2.5-1.62-4.08-1.62-3.31 0-6 2.69-6 6s2.69 6 6 6c1.58 0 3.01-.62 4.08-1.62l14.25 8.31c-.1.42-.16.86-.16 1.31A5.83 5.83 0 1 0 36 32.17z"/></svg>
    , 'volume-up': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M6 18v12h8l10 10V8L14 18H6zm27 6c0-3.53-2.04-6.58-5-8.05v16.11c2.96-1.48 5-4.53 5-8.06zM28 6.46v4.13c5.78 1.72 10 7.07 10 13.41s-4.22 11.69-10 13.41v4.13c8.01-1.82 14-8.97 14-17.54S36.01 8.28 28 6.46z"/></svg>
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

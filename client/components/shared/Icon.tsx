import * as PropTypes from 'prop-types'
import * as React from 'react'

type IconType = 
    'activity' |
    'add' |
    'arrow-back' |
    'arrow-drop-down' |
    'arrow-forward' |
    'autoplay' |
    'bookmark' |
    'bookmark-outline' |
    'cancel' |
    'chat' |
    'check' |
    'check-box' |
    'check-box-outline' |
    'chevron-left' |
    'chevron-right' |
    'close' |
    'delete' |
    'expand-less' |
    'expand-more' |
    'file-upload' |
    'fullscreen' |
    'fullscreen-exit' |
    'home' |
    'menu' |
    'more-vert' |
    'notifications' |
    'pause' |
    'person' |
    'pin' |
    'play' |
    'reply' |
    'sad-face' |
    'search' |
    'share' |
    'video' |
    'volume-down' |
    'volume-up' |
    'volume-mute' |
    'whatshot'

const ICONS: {[key in IconType]: any} = {
      'activity': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M40 26H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h34c1.1 0 2-.9 2-2V28c0-1.1-.9-2-2-2zm0-20H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h34c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>
    , 'add': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M38 26H26v12h-4V26H10v-4h12V10h4v12h12v4z"/></svg>
    , 'arrow-back': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M40 22H15.66l11.17-11.17L24 8 8 24l16 16 2.83-2.83L15.66 26H40v-4z"/></svg>
    , 'arrow-drop-down': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M14 20l10 10 10-10z"/></svg>
    , 'arrow-forward': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M24 8l-2.83 2.83L32.34 22H8v4h24.34L21.17 37.17 24 40l16-16z"/></svg>
    , 'autoplay': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect className="cls-1" x="7.67" y="7.08" width="32.67" height="32.67" rx="8.17" ry="8.17"/><path className="cls-2" d="M16.49,30.18l5.42-12.24a2.11,2.11,0,0,1,2-1.36h0.2a2.08,2.08,0,0,1,2,1.36l5.42,12.24a1.67,1.67,0,0,1,.18.69,1.62,1.62,0,0,1-1.62,1.64,1.74,1.74,0,0,1-1.64-1.18l-1-2.44H20.54l-1.09,2.55a1.68,1.68,0,0,1-1.58,1.07,1.57,1.57,0,0,1-1.58-1.6A1.82,1.82,0,0,1,16.49,30.18Zm9.62-4.31L24,20.74,21.8,25.87h4.31Z" transform="translate(0 -0.59)"/></svg>
    , 'bookmark': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M34 6H14c-2.21 0-3.98 1.79-3.98 4L10 42l14-6 14 6V10a4 4 0 0 0-4-4z"/></svg>
    , 'bookmark-outline': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M34 6H14c-2.21 0-3.98 1.79-3.98 4L10 42l14-6 14 6V10a4 4 0 0 0-4-4zm0 30l-10-4.35L14 36V10h20v26z"/></svg>
    , 'cancel': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm10 27.17L31.17 34 24 26.83 16.83 34 14 31.17 21.17 24 14 16.83 16.83 14 24 21.17 31.17 14 34 16.83 26.83 24 34 31.17z"/></svg>
    , 'chat': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M40 4H8C5.79 4 4 5.79 4 8v36l8-8h28c2.21 0 4-1.79 4-4V8c0-2.21-1.79-4-4-4z"/></svg>
    , 'check': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M18 32.34L9.66 24l-2.83 2.83L18 38l24-24-2.83-2.83z"/></svg>
    , 'check-box': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M38 6H10c-2.21 0-4 1.79-4 4v28c0 2.21 1.79 4 4 4h28c2.21 0 4-1.79 4-4V10c0-2.21-1.79-4-4-4zM20 34L10 24l2.83-2.83L20 28.34l15.17-15.17L38 16 20 34z"/></svg>
    , 'check-box-outline': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M38 10v28H10V10h28m0-4H10c-2.21 0-4 1.79-4 4v28c0 2.21 1.79 4 4 4h28c2.21 0 4-1.79 4-4V10c0-2.21-1.79-4-4-4z"/></svg>
    , 'chevron-left': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M30.83 14.83L28 12 16 24l12 12 2.83-2.83L21.66 24z"/></svg>
    , 'chevron-right': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M20 12l-2.83 2.83L26.34 24l-9.17 9.17L20 36l12-12z"/></svg>
    , 'close': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M38 12.83L35.17 10 24 21.17 12.83 10 10 12.83 21.17 24 10 35.17 12.83 38 24 26.83 35.17 38 38 35.17 26.83 24z"/></svg>
    , 'delete': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M12 38c0 2.2 1.8 4 4 4h16c2.2 0 4-1.8 4-4V14H12v24zm4.93-14.24l2.83-2.83L24 25.17l4.24-4.24 2.83 2.83L26.83 28l4.24 4.24-2.83 2.83L24 30.83l-4.24 4.24-2.83-2.83L21.17 28l-4.24-4.24zM31 8l-2-2H19l-2 2h-7v4h28V8z"/></svg>
    , 'expand-less': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M24 16L12 28l2.83 2.83L24 21.66l9.17 9.17L36 28z"/></svg>
    , 'expand-more': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M33.17 17.17L24 26.34l-9.17-9.17L12 20l12 12 12-12z"/></svg>
    , 'file-upload': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M18 32h12V20h8L24 6 10 20h8zm-8 4h28v4H10z"/></svg>
    , 'fullscreen': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M14 28h-4v10h10v-4h-6v-6zm-4-8h4v-6h6v-4H10v10zm24 14h-6v4h10V28h-4v6zm-6-24v4h6v6h4V10H28z"/></svg>
    , 'fullscreen-exit': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z"/></svg>
    , 'home': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M20 40V28h8v12h10V24h6L24 6 4 24h6v16z"/></svg>
    , 'menu': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M6 36h36v-4H6v4zm0-10h36v-4H6v4zm0-14v4h36v-4H6z"/></svg>
    , 'more-vert': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M24 16c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 4c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 12c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/></svg>
    , 'notifications': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M24 44c2.21 0 4-1.79 4-4h-8c0 2.21 1.79 4 4 4zm12-12V22c0-6.15-3.27-11.28-9-12.64V8c0-1.66-1.34-3-3-3s-3 1.34-3 3v1.36c-5.73 1.36-9 6.49-9 12.64v10l-4 4v2h32v-2l-4-4z"/></svg>
    , 'pause': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M12 38h8V10h-8v28zm16-28v28h8V10h-8z"/></svg>
    , 'person': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M24 24c4.42 0 8-3.59 8-8 0-4.42-3.58-8-8-8s-8 3.58-8 8c0 4.41 3.58 8 8 8zm0 4c-5.33 0-16 2.67-16 8v4h32v-4c0-5.33-10.67-8-16-8z"/></svg>
    , 'pin': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M29.7,18.3L18.3,7l1.4-1.4l-2.8-2.8L2.8,16.9l2.8,2.8L7,18.3l11.3,11.3v5.7l2.8,2.8l7.4-7.4l8.5,8.5l2.3-2.3l-8.5-8.5l7.4-7.4l-2.8-2.8H29.7z"/></svg>
    , 'play': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M16 10v28l22-14z"/></svg>
    , 'reply': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M20 18v-8L6 24l14 14v-8.2c10 0 17 3.2 22 10.2-2-10-8-20-22-22z"/></svg>
    , 'sad-face': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M23.99 4C12.94 4 4 12.95 4 24s8.94 20 19.99 20S44 35.05 44 24 35.04 4 23.99 4zM24 40c-8.84 0-16-7.16-16-16S15.16 8 24 8s16 7.16 16 16-7.16 16-16 16zm8.36-24.49l-2.12 2.13-2.12-2.13L26 17.64l2.12 2.12L26 21.88 28.12 24l2.12-2.12L32.36 24l2.13-2.12-2.13-2.12 2.13-2.12zM15.64 24l2.12-2.12L19.88 24 22 21.88l-2.12-2.12L22 17.64l-2.12-2.13-2.12 2.13-2.12-2.13-2.13 2.13 2.13 2.12-2.13 2.12zM24 28c-4.66 0-8.62 2.92-10.22 7h20.44c-1.6-4.08-5.56-7-10.22-7z"/></svg>
    , 'search': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M31 28h-1.59l-.55-.55C30.82 25.18 32 22.23 32 19c0-7.18-5.82-13-13-13S6 11.82 6 19s5.82 13 13 13c3.23 0 6.18-1.18 8.45-3.13l.55.55V31l10 9.98L40.98 38 31 28zm-12 0c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9z"/></svg>
    , 'share': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M0.6,44.5C7,35.5,16.1,31.4,29,31.4v10.6l18-18l-18-18v10.3C10.9,18.7,3.2,31.6,0.6,44.5z"/></svg>
    , 'video': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M34 21v-7c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v20c0 1.1.9 2 2 2h24c1.1 0 2-.9 2-2v-7l8 8V13l-8 8z"/></svg>
    , 'volume-down': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M37 24c0-3.53-2.04-6.58-5-8.05v16.11c2.96-1.48 5-4.53 5-8.06zm-27-6v12h8l10 10V8L18 18h-8z"/></svg>
    , 'volume-up': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M6 18v12h8l10 10V8L14 18H6zm27 6c0-3.53-2.04-6.58-5-8.05v16.11c2.96-1.48 5-4.53 5-8.06zM28 6.46v4.13c5.78 1.72 10 7.07 10 13.41s-4.22 11.69-10 13.41v4.13c8.01-1.82 14-8.97 14-17.54S36.01 8.28 28 6.46z"/></svg>
    , 'volume-mute': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M14 18v12h8l10 10V8L22 18h-8z"/></svg>
    , 'whatshot': <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M27 1.34s1.48 5.3 1.48 9.6c0 4.12-2.7 7.47-6.83 7.47s-7.25-3.34-7.25-7.47l.05-.72C10.43 15.03 8 21.23 8 28c0 8.84 7.16 16 16 16s16-7.16 16-16c0-10.79-5.19-20.41-13-26.66zM23.42 38c-3.56 0-6.45-2.81-6.45-6.28 0-3.25 2.09-5.53 5.63-6.24s7.2-2.41 9.23-5.15c.78 2.58 1.19 5.3 1.19 8.07 0 5.29-4.3 9.6-9.6 9.6z"/></svg>
}

interface Props {
    type: IconType
}

class Icon extends React.Component<Props> {

    shouldComponentUpdate(nextProps: Props) {
        return nextProps.type !== this.props.type
    }

    renderSvg(type: IconType) {
        return ICONS[type] ? ICONS[type] : <svg></svg>
    }

    render() {
        const typeClass = `svg-icon-${this.props.type}`
        return <span className={`svg-icon ${typeClass}`}>{ this.renderSvg(this.props.type) }</span>;
    }
}

export default Icon;

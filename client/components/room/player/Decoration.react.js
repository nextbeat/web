import React from 'react'

import { escape } from 'lodash'
import linkify from 'linkifyjs/html'

function markupCaption(str) {
    const captionHtml = linkify(escape(str), {
        defaultProtocol: 'https',
        target: '_blank',
        attributes: {
            rel: 'nofollow'
        },
        validate: (value, type) => {
            return type !== 'hashtag'
        }
    })
    return { __html: captionHtml }
}



class Decoration extends React.Component {

    render() {
        const { decoration } = this.props 
        const offset = parseFloat(decoration.get('caption_offset', '0.5'))*100
        return <div className="player_caption" id="player_caption" style={{top: `${offset}%`}} dangerouslySetInnerHTML={markupCaption(decoration.get('caption_text'))} />
    }
}

export default Decoration

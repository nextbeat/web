import * as React from 'react'

import escape from 'lodash-es/escape'
import linkify from 'linkifyjs/html'
import { shallowEqual } from '../../../utils'

function markupCaption(str: string) {
    const captionHtml = linkify(escape(str), {
        defaultProtocol: 'https',
        target: '_blank',
        attributes: {
            rel: 'nofollow'
        },
        validate: (value: any, type: string) => {
            return type !== 'hashtag'
        }
    })
    return { __html: captionHtml }
}

interface Props {
    decoration: any
    width: number
    height: number
    barHeight?: number
}

interface State {
    parentHeight: number
    captionHeight: number
    displayCaption: boolean
}

class Decoration extends React.PureComponent<Props, State> {

    private _node: HTMLDivElement

    constructor(props: Props) {
        super(props)

        this.resize = this.resize.bind(this)

        this.containerStyle = this.containerStyle.bind(this)
        this.captionStyle = this.captionStyle.bind(this)

        this.state = {
            parentHeight: 0,
            captionHeight: 0,
            displayCaption: false
        }
    }

    componentDidMount() {
        const node = $(this._node)
        $(window).on('resize.decoration', this.resize.bind(this, node))
        window.setTimeout(() => {
            this.resize(node)
        })
    }

    componentWillUnmount() {
        $(window).off('resize.decoration')
    }


    // Resize

    resize(node: JQuery<HTMLElement>) {
        const parent = node.parent()
        const caption = node.find('.player_caption')

        this.setState({
            parentHeight: parent.height() as number,
            captionHeight: caption.innerHeight() as number,
            displayCaption: true
        })
    }


    // Styles

    containerStyle() {
        const { width, height } = this.props
        return {
            width: `${width}px`,
            height: `${height}px`,
        }
    }

    captionStyle() {
        const { decoration, width, height, barHeight } = this.props
        const { captionHeight, parentHeight, displayCaption } = this.state

        let offset = parseFloat(decoration.get('caption_offset', '0.5'))
        let top = Math.min(offset*height, height-captionHeight)
        // update offset so that it doesn't intersect with 
        // the bar at the bottom of the parent div
        if (barHeight) {
            let parentMargin = Math.max((parentHeight-height)/2, 0)
            let maxTop = parentHeight-(barHeight+captionHeight)
            top = Math.min(maxTop, top+parentMargin)-parentMargin;
        }

        return {
            top: `${top}px`,
            display: displayCaption ? 'block' : 'none'
        }
    }


    // Render

    render() {
        const { decoration } = this.props 
        return (
            <div className="player_decoration" style={this.containerStyle()} ref={ c => { if (c) { this._node = c } }}>
                <div className="player_caption" 
                    id="player_caption" 
                    style={this.captionStyle()}
                    dangerouslySetInnerHTML={markupCaption(decoration.get('caption_text'))} 
                />
            </div>
        )
    }
}

export default Decoration

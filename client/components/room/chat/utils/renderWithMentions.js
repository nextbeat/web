import React from 'react'
import inRange from 'lodash/inRange'
import { List } from 'immutable'

function renderWithRegexMentions(message, { start, end, onClick }) {
    const re = /(@\w+)/

    return message.substring(start, end).split(re).map((str, idx) => {
        const key = `@${idx}`
        if (str.charAt(0) === '@') {
            const username = str.substring(1)
            return <a key={key} className="chat_mention" onClick={onClick.bind(this, username)}>{str}</a>
        }
        return <span key={key}>{str}</span>
    })
}

export default function renderWithMentions(comment, { start, end, onClick, forceMentions=false }) {
    let message = comment.get('message')
    start = start || 0
    end = end || message.length
    onClick = onClick || (() => {})

    if (forceMentions) {
        // if specified, render as a mention any word starting with the @ symbol
        // and ignore the user_mentions data
        return renderWithRegexMentions(message, { start, end, onClick })
    }

    let mentions = comment.get('user_mentions') || List()
    let inclusiveMentions = mentions.filter(m => inRange(m.get('indices').get(0), start, end))

    // construct an array of <span>s using index data in mentions
    let elems   = [] 
    let idx     = start // keeps track of current index of string
    inclusiveMentions.forEach(m => {
        const [mStart, mEnd] = m.get('indices').toJS()
        elems.push(<span key={`${idx},${mStart}`}>{ message.substring(idx, mStart) }</span>)

        const mentionKey = `${mStart},${mEnd}`
        const url = `/u/${m.get('username')}`
        elems.push(
            <a key={mentionKey} className="chat_mention" onClick={onClick.bind(this, m.get('username'))}>
                { message.substring(mStart, mEnd) }
            </a>
        )

        idx = mEnd
    })
    elems.push(<span key={`${idx},${end}`}>{ message.substring(idx, end) }</span>)

    return elems
}
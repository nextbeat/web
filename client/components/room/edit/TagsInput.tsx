import * as React from 'react'
import { List } from 'immutable'
import Icon from '@components/shared/Icon'

const MAX_TAG_COUNT = 5;

interface Props {
    tags: List<string>
    onChange: (tags: List<string>) => void
}

interface State {
    currentTagString: string
}

class TagsInput extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)

        this.handleTagClose = this.handleTagClose.bind(this)

        this.handleTagChange = this.handleTagChange.bind(this)
        this.handleTagKeyDown = this.handleTagKeyDown.bind(this)
        this.handleTagBlur = this.handleTagBlur.bind(this)

        this.renderTag = this.renderTag.bind(this)

        this.state = {
            currentTagString: ''
        }
    }


    // Events

      handleTagClose(idx: number) {
        const { tags, onChange } = this.props 
        onChange(tags.delete(idx))
    }

    handleTagChange(e: React.FormEvent<HTMLInputElement>) {
        const { tags, onChange } = this.props 
        if (tags.size >= MAX_TAG_COUNT) {
            return;
        }

        const value = e.currentTarget.value
        if ([',', ' '].indexOf(value[value.length-1]) !== -1) {
            const tag = value.substr(0, value.length-1)
            if (tag.length > 0) {
                this.setState({
                    currentTagString: ''
                })
                onChange(tags.push(tag))
            }
        } else {
            this.setState({ 
                currentTagString: e.currentTarget.value 
            })
        }
    }

    handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        // key press doesn't register backspace for some reason
        const { currentTagString } = this.state 
        const { tags, onChange } = this.props 

        if (e.keyCode === 8 && currentTagString.length === 0) { // backspace
            e.preventDefault()

            this.setState({
                currentTagString: tags.last() || ''
            })
            onChange(tags.pop())
            process.nextTick(() => {
                e.currentTarget.select()
            })
        }
    }

    handleTagBlur() {
        // turn last string into a tag
        const { currentTagString } = this.state
        const { tags, onChange } = this.props  

        if (currentTagString.length > 0) {
            if (tags.size < MAX_TAG_COUNT) {
                onChange(tags.push(currentTagString))
            }
            this.setState({
                currentTagString: ''
            })
        }
    }


    // Render

    renderTag(tag: string, index: number) {
        return (
            <div className="edit-room_tag" key={index}>
                <span>{tag}</span>
                <div onClick={this.handleTagClose.bind(this, index)}><Icon type="close" /></div>
            </div>
        )
    }

    render() {
        const { tags } = this.props
        const { currentTagString } = this.state 

        return (
            <div className="edit-room_tags">
                { tags.map((tag, idx) => this.renderTag(tag, idx) ) }
                <input type="text" 
                    className="edit-room_tags-input" 
                    value={currentTagString} 
                    onChange={this.handleTagChange} 
                    onKeyDown={this.handleTagKeyDown}
                    onBlur={this.handleTagBlur}
                    placeholder={tags.size === 0 ? "Tags (e.g. vlog, cooking, disneyland)" : ""} 
                />
            </div>
        )
    }
}

export default TagsInput
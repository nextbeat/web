import React from 'react'
import Icon from '../../shared/Icon.react'

const MAX_TAG_COUNT = 5;

class TagsInput extends React.Component {

    constructor(props) {
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

      handleTagClose(idx) {
        const { tags, onChange } = this.props 
        onChange(tags.delete(idx))
    }

    handleTagChange(e) {
        const { tags, onChange } = this.props 
        if (tags.size >= MAX_TAG_COUNT) {
            return;
        }

        const value = e.target.value
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
                currentTagString: e.target.value 
            })
        }
    }

    handleTagKeyDown(e) {
        // key press doesn't register backspace for some reason
        const { currentTagString } = this.state 
        const { tags, onChange } = this.props 

        if (e.keyCode === 8 && currentTagString.length === 0) { // backspace
            e.preventDefault()

            this.setState({
                currentTagString: tags.last()
            })
            onChange(tags.pop())
            process.nextTick(() => {
                e.target.select()
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

    renderTag(tag, index) {
        return (
            <div className="edit-room_tag" key={index}>
                {tag}
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

TagsInput.propTypes = {
    tags: React.PropTypes.object.isRequired, // Immutable List
    onChange: React.PropTypes.func.isRequired
}

export default TagsInput
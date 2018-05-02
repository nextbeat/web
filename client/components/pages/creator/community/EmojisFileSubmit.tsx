import * as React from 'react'
import { connect } from 'react-redux'

import FileComponent, { FileComponentProps } from '@components/utils/FileComponent'
import { selectEmojiFile, setEmojiFileError, addEmoji } from '@actions/pages/creator/community'
import { State, DispatchProps } from '@types'

interface OwnProps {
    file: File
}

interface ComponentState {
    name: string
}

type Props = OwnProps & DispatchProps & FileComponentProps

class EmojisFileSubmit extends React.Component<Props, ComponentState> {

    constructor(props: Props) {
        super(props)

        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleCancel = this.handleCancel.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)

        this.state = {
            name: ''
        }
    }

    handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
        const { dispatch } = this.props;
        if (e.charCode === 13) { // enter
            this.handleSubmit(e)
        }
    }

    handleChange(e: React.FormEvent<HTMLInputElement>) {
        this.setState({ name: e.currentTarget.value.substr(0, 12) })
    }

    handleCancel(e: React.MouseEvent<HTMLElement>) {
        this.props.dispatch(selectEmojiFile(undefined))
    }

    handleSubmit(e: React.FormEvent<HTMLElement>) {
        const { getBase64String, width, height, dispatch } = this.props
        const { name } = this.state

        getBase64String().then((data) => {
            const emojiObject = {
                name: name.trim(),
                image: data,
                width,
                height
            }
            dispatch(addEmoji(emojiObject))
        })
    }

    render() {
        const { 
            resourceLoaded,
            height, width,
            offsetX, offsetY
        } = this.props
        const { name } = this.state

        return (
            <div className="community_box_submit_container">
                <div className="community_box_submit_fields">
                    <div className="community_emojis_file_container">
                        <div id="community_emojis_submit_image_container" className="community_emojis_submit_image_container">
                            <img id="community_emojis_submit_image"
                                className="community_emojis_submit_image"
                                style={{ 
                                    display: resourceLoaded ? 'block' : 'none',
                                    position: 'absolute', 
                                    width: `${width}px`,
                                    height: `${height}px`,
                                    top: `${offsetY}px`,
                                    left: `${offsetX}px`
                                }}
                            /> 
                        </div>
                        <input 
                            placeholder="Add name"
                            className="community_box_input"
                            onKeyPress={this.handleKeyPress} 
                            onChange={this.handleChange}
                            value={name}
                        />
                        <div className="community_box_cancel" onClick={this.handleCancel}>Cancel</div>
                    </div>
                    <input type="submit" 
                        className="community_box_submit"
                        value="Add" 
                        disabled={name.trim().length === 0} 
                        onClick={this.handleSubmit}
                    />
                </div>
            </div>
        )
    }
}

const fileOptions = {
    onImageLoad: function(this: EmojisFileSubmit, src: string) {
        const { resourceWidth, resourceHeight, dispatch } = this.props
        if (resourceWidth !== 64 || resourceHeight !== 64) {
            dispatch(setEmojiFileError('Image does not have correct dimensions. Please try again.'))
            return
        }

        let imageElement = document.getElementById('community_emojis_submit_image') as HTMLImageElement
        imageElement.src = src
    }
}

// Necessary for Typescript
function mapStateToProps(state: State, ownProps: OwnProps): {} {
    return {}
}

export default connect(mapStateToProps)(FileComponent('community_emojis_submit_image_container', fileOptions)(EmojisFileSubmit));


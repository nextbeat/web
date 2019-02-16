import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import Spinner from '@components/shared/Spinner'
import EmojisFileSubmit from './EmojisFileSubmit'

import { loadEmojis, selectEmojiFile, setEmojiFileError, removeEmoji } from '@actions/pages/creator/community'
import Emoji from '@models/objects/emoji'
import Community from '@models/state/pages/creator/community'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    isFetching: boolean
    hasFetched: boolean
    error?: string
    emojis: List<Emoji>

    file?: File
    fileError?: string
    isAdding: boolean
    addError?: string
    isRemoving: boolean
    removeError?: string
}

type Props = ConnectProps & DispatchProps

class Emojis extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.handleRemoveClick = this.handleRemoveClick.bind(this)
        this.handleFileChange = this.handleFileChange.bind(this)

        this.renderEmoji = this.renderEmoji.bind(this)
    }

    componentDidMount() {
        this.props.dispatch(loadEmojis())
    }

    componentDidUpdate(prevProps: Props) {
        const { isAdding, isRemoving, addError, removeError, dispatch } = this.props

        if ((prevProps.isAdding && !isAdding && !addError)
            || (prevProps.isRemoving && !isRemoving && !removeError)) 
        {
            dispatch(loadEmojis())
        }
    }

    handleFileChange(e: React.FormEvent<HTMLInputElement>) {
        const { dispatch } = this.props
        if (e.currentTarget.files && e.currentTarget.files.length > 0) {
            const file = e.currentTarget.files[0]
            if (file.type === 'image/png' && file.size < 32*1024) {
                dispatch(selectEmojiFile(file))
            } else {
                dispatch(setEmojiFileError('File size too large. Please try again.'))
            }
        }
    }

    handleRemoveClick(emoji: Emoji) {
        this.props.dispatch(removeEmoji(emoji))
    }

    renderEmoji(emoji: Emoji) {
        return (
            <div className="community_box_element" key={emoji.get('name')}>
                <div 
                    className="community_box_element_thumbnail" 
                    style={{backgroundImage: `url(${emoji.url()})`}}
                />
                <div className="community_box_element_text">{ emoji.get('name') }</div>
                <div className="community_box_element_remove" onClick={this.handleRemoveClick.bind(this, emoji)}>Remove</div>
            </div>
        )
    }

    render() {
        const { isFetching, isAdding, isRemoving, emojis, file, fileError } = this.props
        const isProcessing = isFetching || isAdding || isRemoving

        return (
            <div className="community_box">
                <div className="community_box_list">
                    { isProcessing && <Spinner styles={["grey"]} /> }
                    { !isProcessing && emojis.map(emoji => this.renderEmoji(emoji)) }
                </div>
                { !file && 
                    <div className="community_box_submit_container">
                        { fileError && <div className="community_box_submit_error">{fileError}</div>}
                        <div className="community_box_submit_fields">
                            <input type="file"
                                id="community_emojis_upload-file"
                                className="upload_file-input"
                                accept="image/png"
                                onChange={this.handleFileChange}
                            />
                            <input type="submit"
                                className="community_box_submit"
                                value="Select file"
                                onClick={() => $('#community_emojis_upload-file').click()}
                            />
                            <input type="submit" 
                                className="community_box_submit"
                                value="Add" 
                                disabled={true} 
                            />
                        </div>
                    </div>
                }
                { file && <EmojisFileSubmit file={file} />}
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        isFetching: Community.get(state, 'isFetchingEmojis'),
        hasFetched: Community.get(state, 'hasFetchedEmojis'),
        error: Community.get(state, 'emojisError'),
        emojis: Community.emojis(state),

        file: Community.get(state, 'emojiFile'),
        fileError: Community.get(state, 'emojiFileError'),
        isAdding: Community.get(state, 'isAddingEmoji'),
        addError: Community.get(state, 'addEmojiError'),
        isRemoving: Community.get(state, 'isRemovingEmoji'),
        removeError: Community.get(state, 'removeEmojiError')
    }
}

export default connect(mapStateToProps)(Emojis)


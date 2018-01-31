import * as React from 'react'
import { connect } from 'react-redux'
import { Map } from 'immutable'

import { updateNewMediaItem } from '@actions/upload'
import Upload from '@models/state/upload'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    title: string
}

type Props = ConnectProps & DispatchProps

class AddTitle extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(e: React.FormEvent<HTMLInputElement>) {
        this.props.dispatch(updateNewMediaItem({ title: e.currentTarget.value.substring(0, 120) }))
    }

    render() {
        const { title } = this.props

        return (
            <div className="upload_add-title upload_section">
                <div className="upload_subheader">
                    <div>
                        Add post title <span className="upload_subheader-optional">(optional)</span>
                        <div className="upload_description">The title will appear in the upper left of the post and on the activity page.</div>
                    </div>
                </div>
                <input className="upload_input" type="text" value={title} onChange={this.handleChange} placeholder="Post Title" />
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        title: Upload.get(state, 'mediaItem', Map()).get('title', '')
    }
}

export default connect(mapStateToProps)(AddTitle)
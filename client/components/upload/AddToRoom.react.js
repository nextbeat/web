import React from 'react'

import SelectableStackItem from './SelectableStackItem.react'

class AddToRoom extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const { upload, stacks } = this.props
        return (
            <div className="upload_add">
                <div className="upload_subheader">Add { upload.fileType() } to room</div>
                <div className="upload_stacks">
                    { stacks.map(stack => <SelectableStackItem key={stack.get('id')} stack={stack} upload={upload} />)}
                    <SelectableStackItem stack={null} upload={upload} />
                </div>
            </div>
        );
    }
}

export default AddToRoom;

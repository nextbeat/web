import React from 'react'

import SelectableStackItem from './SelectableStackItem.react'

const MAX_ITEM_WIDTH = 260;
const MIN_ITEM_WIDTH = 200;
const MARGIN_WIDTH = 20;

class AddToRoom extends React.Component {

    constructor(props) {
        super(props)

        this.resize = this.resize.bind(this)

        this.state = {
            itemWidth: MAX_ITEM_WIDTH
        }   
    }


    // Component lifecycle

    componentDidMount() {
        var node = $(this._node)
        $(window).on('resize.upload', this.resize.bind(this, node))
        this.resize(node)
    }

    componentWillUnmount() {
        $(window).off('resize.upload')
    }


    // Resize

    resize(node) {
        const { stacks } = this.props 

        const nodeWidth = node.width()
        let numAcross = Math.max(1, Math.floor(nodeWidth/(MIN_ITEM_WIDTH+MARGIN_WIDTH)))

        let itemWidth = MAX_ITEM_WIDTH
        if (numAcross <= stacks.size+1) {
            itemWidth = Math.min(MAX_ITEM_WIDTH, Math.floor((nodeWidth - MARGIN_WIDTH*(numAcross))/numAcross))
        }

        this.setState({
            itemWidth
        })
    }


    // Render

    render() {
        const { upload, stacks } = this.props
        const { itemWidth } = this.state
        return (
            <div className="upload_add">
                <div className="upload_subheader">Add { upload.fileType() } to room</div>
                <div className="upload_stacks" ref={c => this._node = c}>
                    { stacks.map(stack => <SelectableStackItem key={stack.get('id')} stack={stack} upload={upload} width={itemWidth} />)}
                    <SelectableStackItem stack={null} upload={upload} width={itemWidth} />
                </div>
            </div>
        );
    }
}

export default AddToRoom;

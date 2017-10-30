import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import SelectableStackItem from './SelectableStackItem'
import Upload, { UploadType } from '@models/state/upload'
import CurrentUser from '@models/state/currentUser'
import Stack from '@models/entities/stack'
import { State } from '@types'

interface Props {
    stacks: List<Stack>
    fileType: 'image' | 'video' | null
}

interface ComponentState {
    itemWidth: number
}

const MAX_ITEM_WIDTH = 260;
const MIN_ITEM_WIDTH = 200;
const MARGIN_WIDTH = 20;

class AddToRoom extends React.Component<Props, ComponentState> {

    private _node: HTMLDivElement

    constructor(props: Props) {
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

    resize(node: JQuery<HTMLElement>) {
        const { stacks } = this.props 

        const nodeWidth = node.width() || 0
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
        const { stacks, fileType } = this.props
        const { itemWidth } = this.state
        return (
            <div className="upload_add">
                <div className="upload_subheader">Add {fileType} to room</div>
                <div className="upload_stacks" ref={c => { if (c) { this._node = c } }}>
                    { stacks.map(stack => <SelectableStackItem key={stack.get('id')} stack={stack} width={itemWidth} />)}
                    <SelectableStackItem stack={null} width={itemWidth} />
                </div>
            </div>
        );
    }
}

function mapStateToProps(state: State): Props {
    return {
        stacks: CurrentUser.openStacks(state),
        fileType: Upload.fileType(state, UploadType.MediaItem)
    }
}

export default connect(mapStateToProps)(AddToRoom);

import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { List, Map } from 'immutable'

import LargeStackItem from '@components/shared/LargeStackItem'
import Icon from '@components/shared/Icon'

import App from '@models/state/app'
import CurrentUser from '@models/state/currentUser'
import Home from '@models/state/pages/home'
import Stack from '@models/entities/stack'
import { State } from '@types'

const DEFAULT_ITEM_WIDTH = 220;
const MARGIN_WIDTH = 10;
const BADGE_OFFSET_LEFT = 5;
const BADGE_OFFSET_TOP = 5;

interface OwnProps {
    index: number
}

interface ConnectProps {
    width: string
    isLoggedIn: boolean

    stacks: List<Stack>
    section: State
}

type Props = OwnProps & ConnectProps

interface ComponentState {
    leftIndex: number // index of the current leftmost visible stack
    numAcross: number // number of visible stacks
    itemWidth: number // width of a stack item
    shouldAnimate: boolean // boolean determining whether the stacks list should animate a shift in stack index
}

class HomeSection extends React.Component<Props, ComponentState> {

    private _node: HTMLDivElement

    constructor(props: Props) {
        super(props);

        this.state = {
            leftIndex: 0, 
            numAcross: 0, 
            itemWidth: DEFAULT_ITEM_WIDTH, 
            shouldAnimate: true
        }

        this.navLeft = this.navLeft.bind(this)
        this.navRight = this.navRight.bind(this)
        this.resize = this.resize.bind(this)
    }

    componentDidMount() {
        const node = $(this._node);
        const content = node.parent();
        $(window).on(`resize.section${this.props.index}`, this.resize.bind(this, node, content));
        this.resize(node, content);
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.isLoggedIn !== prevProps.isLoggedIn) {
            // recalculate sizes to account for sidebar
            const node = $(this._node);
            const content = node.parent();
            this.resize(node, content);
        }
    }

    componentWillUnmount() {
        $(window).off(`resize.section${this.props.index}`);
    }

    // Resize

    resize(node: JQuery, parent: JQuery) {
        const { leftIndex: oldLeftIndex } = this.state 
        const { stacks, width } = this.props 

        const parentWidth = parent.width() || 0
        const appWidth = width
        let sectionWidth = parentWidth - 40;

        /**
         * We use component state to dynamically resize the stacks list and shift
         * the left index appropriately.
         */
        let numAcross = Math.max(2, Math.floor(sectionWidth/DEFAULT_ITEM_WIDTH))
        if (parentWidth <= 320) {
            numAcross = 1
        }
        
        let leftIndex = Math.max(0, Math.min(stacks.size-numAcross, oldLeftIndex))
        let itemWidth = Math.floor((sectionWidth - MARGIN_WIDTH*(numAcross-1)) / numAcross)

        this.setState({
            numAcross,
            leftIndex,
            itemWidth,
            shouldAnimate: false
        })
    }

    // Actions

    navLeft() {
        const { leftIndex, numAcross } = this.state
        if (leftIndex === 0) {
            return;
        }
        this.setState({ 
            leftIndex: Math.max(0, leftIndex-numAcross),
            shouldAnimate: true 
        })
    }

    navRight() {
        const { leftIndex, numAcross } = this.state
        const { stacks } = this.props
        if (leftIndex >= stacks.size-numAcross) {
            return;
        }
        this.setState({ 
            leftIndex: Math.min(stacks.size-numAcross, leftIndex+numAcross),
            shouldAnimate: true
        })
    }

    // Render

    render() {
        const { section, stacks, index } = this.props
        const { leftIndex, numAcross, itemWidth, shouldAnimate } = this.state

        const sectionUrl = section.get('slug') ? `/s/${section.get('slug')}` : section.get('url', '#');

        const highlightedKlass = section.get('highlighted_') ? "highlighted" : ""
        const leftOffset = -(leftIndex*itemWidth + leftIndex*MARGIN_WIDTH - BADGE_OFFSET_LEFT) + 'px'
        const innerWidth = numAcross*itemWidth + (numAcross-1)*MARGIN_WIDTH + BADGE_OFFSET_LEFT + 'px'

        const leftDisplay = leftIndex > 0 ? "block" : "none"
        const rightDisplay = leftIndex < stacks.size-numAcross ? "block" : "none"
        const listStyle = shouldAnimate ? { left: leftOffset, transitionDuration: "0.5s" } : { left: leftOffset }

        return (
            <div className={`home_section ${highlightedKlass}`} ref={c => { if (c) { this._node = c } }}>
                <div className="home_section_inner" style={{width: innerWidth }} >
                    <div className="home_section_header">
                        <div className="home_section_name"><Link to={sectionUrl}>{section.get('name')}</Link></div>
                        {section.get('description') && <div className="home_section_description">{section.get('description')}</div>}
                    </div>
                    <div className="home_section_stacks">
                        <div className="home_section_stacks-inner">
                            <div className="home_section_stacks-list" style={listStyle}>
                                { stacks.map(stack => <LargeStackItem key={`sec${index}s${stack.get('id')}`} stack={stack} static={itemWidth} />)}
                            </div>
                        </div>
                        <div style={{display: leftDisplay}} className="home_section_left home_section_nav" onClick={this.navLeft}><Icon type="chevron-left" /></div>
                        <div style={{display: rightDisplay}} className="home_section_right home_section_nav" onClick={this.navRight}><Icon type="chevron-right" /></div>
                    </div>
                </div>
  
            </div>
        );
    }
}

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {
    return {
        width: App.get(state, 'width'),
        isLoggedIn: CurrentUser.isLoggedIn(state),
        stacks: Home.stacks(state, ownProps.index),
        section: Home.get(state, 'sections', List()).get(ownProps.index, Map<string, any>())
    }
}

export default connect(mapStateToProps)(HomeSection);

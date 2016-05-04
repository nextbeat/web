import React from 'react'
import { Link } from 'react-router'

import LargeStackItem from '../shared/LargeStackItem.react'
import Icon from '../shared/Icon.react'

const DEFAULT_ITEM_WIDTH = 220;
const MARGIN_WIDTH = 10;
const BADGE_OFFSET_LEFT = 5;
const BADGE_OFFSET_TOP = 5;

class HomeSection extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            leftIndex: 0, // index of the current leftmost visible stack
            numAcross: 0, // number of visible stacks
            itemWidth: DEFAULT_ITEM_WIDTH, // width of a stack item
            shouldAnimate: true, // boolean determining whether the stacks list should animate a shift in stack index
        }

        this.navLeft = this.navLeft.bind(this)
        this.navRight = this.navRight.bind(this)
        this.resize = this.resize.bind(this)
    }

    componentDidMount() {
        const node = $(this._node);
        const content = node.parent().parent();
        $(window).on(`resize.section${this.props.index}`, this.resize.bind(this, node, content));
        this.resize(node, content);
    }

    componentWillUnmount() {
        $(window).off(`resize.section${this.props.index}`);
    }

    // Resize

    resize(node, parent) {
        const { leftIndex, numAcross } = this.state 
        const { stacks } = this.props 
        console.log(parent.width())

        /**
         * We use component state to dynamically resize the stacks list and shift
         * the left index appropriately.
         */
        if (parent.width() > 1040) {
            this.setState({ 
                numAcross: 4,
                leftIndex: Math.max(0, Math.min(stacks.size-4, leftIndex)),
                shouldAnimate: false 
            })
        } else if (parent.width() > 820) {
            this.setState({ 
                numAcross: 3,
                leftIndex: Math.max(0, Math.min(stacks.size-3, leftIndex)),
                shouldAnimate: false 
            })
        } else {    
            // If the viewport is small enough we also want to resize stack items
            let itemWidth = DEFAULT_ITEM_WIDTH
            if (parent.width() < 530) {
                itemWidth = Math.floor((parent.width() - 80 - MARGIN_WIDTH) / 2) 
            } 
            this.setState({ 
                numAcross: 2,
                itemWidth: itemWidth,
                shouldAnimate: false 
            })
        }
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
            <div className={`home_section ${highlightedKlass}`} ref={c => this._node = c}>
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

export default HomeSection;

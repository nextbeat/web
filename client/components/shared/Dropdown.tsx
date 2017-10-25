import * as React from 'react'
import { connect } from 'react-redux'

import App from '@models/state/app'
import { closeDropdown } from '@actions/app'
import Icon from '@components/shared/Icon'

import { State, DispatchProps } from '@types'

interface ConnectProps {
    isActive: boolean
}

interface OwnProps {
    type: string
    shouldForceClose: boolean
    triangleOnBottom: boolean
    handleClose?: () => void
    style?: string
    triangleMargin?: number
}

type AllProps = OwnProps & ConnectProps & DispatchProps

class Dropdown extends React.Component<AllProps> {

    static defaultProps = {
        shouldForceClose: false,
        triangleOnBottom: false
    }

    constructor(props: AllProps) {
        super(props)
        
        this.hideDropdown = this.hideDropdown.bind(this)
        this.handleKeyUp = this.handleKeyUp.bind(this)
        this.handleClose = this.handleClose.bind(this)
    }

    componentWillReceiveProps(nextProps: AllProps) {
        const { type, isActive, shouldForceClose } = this.props

        // if shouldForceClose is true, client has to manually 
        // close the dropdown by calling the closeDropdown action
        if (shouldForceClose) {
            return;
        }

        if (!isActive && nextProps.isActive) {
            $(document).on(`mouseup.dropdown-${type}`, this.hideDropdown)
            $(document).on(`keyup.dropdown-${type}`, this.handleKeyUp)
        } else if (isActive && !nextProps.isActive) {
            $(document).off(`mouseup.dropdown-${type}`)
            $(document).off(`keyup.dropdown-${type}`)
        }
    }

    handleKeyUp(e: JQuery.Event) {
        const { type, dispatch } = this.props
        if (e.which === 27) { // esc
            this.handleClose()
        }
    }

    hideDropdown(e: JQuery.Event) {
        const { type, dispatch } = this.props
        let $dropdown = $(`#dropdown-${type}`)
        let $toggle = $(`.dropdown-${type}_toggle`)

        // check that target isn't dropdown. note that we DO want to hide 
        // if the target is one of the dropdown's descendants, since all of those 
        // should be links which should, on click, collapse the dropdown
        if (!($dropdown.is(e.target as Element)
            || $toggle.is(e.target as Element) 
            || $toggle.has(e.target as Element).length > 0)) 
        {   
            process.nextTick(() => {
                $(document).off(`mouseup.dropdown-${type}`);
                this.handleClose()
            })
        }
    }

    handleClose() {
        const { type, dispatch, handleClose } = this.props

        // can pass handleClose from props
        if (typeof handleClose === 'function') {
            handleClose()
        } else {
            dispatch(closeDropdown(type))
        }
    }

    render() {
        const { type, style, children, isActive, triangleMargin, triangleOnBottom, shouldForceClose } = this.props

        let triangleStyle: any = {}
        if (typeof triangleMargin !== 'undefined') {
            triangleStyle.right = `${triangleMargin}px`
            if (triangleMargin < 0) {
                triangleStyle.display = 'none'
            }
        }

        return (
            <div id={`dropdown-${type}`} 
                className={`dropdown dropdown-${type} ${style ? `dropdown-${style}` : ''}`} 
                style={{ display: isActive ? 'block' : 'none' }}
            >
                <div className={`dropdown_triangle ${triangleOnBottom ? 'bottom' : ''}`} style={triangleStyle} />
                <div className={`dropdown_filler ${triangleOnBottom ? 'bottom' : ''}`} style={triangleStyle} />
                <div className="dropdown_main">
                    { shouldForceClose && 
                        <div className="dropdown_close" onClick={this.handleClose}><Icon type="close" /></div>
                    }
                    {children}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state: State, ownProps: OwnProps) {
    return {
        isActive: App.isActiveDropdown(state, ownProps.type)
    }
}

export default connect(mapStateToProps)(Dropdown);

import React from 'react'
import { connect } from 'react-redux'

import { App } from '../../models'
import { closeDropdown } from '../../actions'

class Dropdown extends React.Component {

    constructor(props) {
        super(props)
        
        this.hideDropdown = this.hideDropdown.bind(this)
        this.handleKeyUp = this.handleKeyUp.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        const { type } = this.props
        if (!this.props.app.isActiveDropdown(type) && nextProps.app.isActiveDropdown(type)) {
            $(window).on(`mouseup.dropdown-${type}`, this.hideDropdown)
            $(window).on(`keyup.dropdown-${type}`, this.handleKeyUp)
        } else if (this.props.app.isActiveDropdown(type) && !nextProps.app.isActiveDropdown(type)) {
            $(window).off(`mouseup.dropdown-${type}`)
            $(window).off(`keyup.dropdown-${type}`)
        }
    }

    handleKeyUp(e) {
        const { type, dispatch } = this.props
        console.log(e, e.charCode, e.which)
        if (e.which === 27) { // esc
            dispatch(closeDropdown(type))
        }
    }

    hideDropdown(e) {
        const { type, dispatch } = this.props
        let $dropdown = $(`#dropdown-${type}`)
        let $toggle = $(`#dropdown-${type}_toggle`)

        // check that target isn't dropdown. note that we DO want to hide 
        // if the target is one of the dropdown's descendants, since all of those 
        // should be links which should, on click, collapse the dropdown
        if (!($dropdown.is(e.target)
            || $toggle.is(e.target) 
            || $toggle.has(e.target).length > 0)) 
        {   
            process.nextTick(() => {
                $(document).off(`mouseup.dropdown-${type}`);
                dispatch(closeDropdown(type))
            })
        }
    }

    render() {
        const { type, children, app, triangleMargin } = this.props

        let triangleStyle = {}
        if (typeof triangleMargin !== 'undefined') {
            triangleStyle.right = `${triangleMargin}px`
            if (triangleMargin < 0) {
                triangleStyle.display = 'none'
            }
        }

        return (
            <div id={`dropdown-${type}`} 
                className={`dropdown dropdown-${type}`} 
                style={{ display: app.isActiveDropdown(type) ? 'block' : 'none' }}
            >
                <div className="dropdown_triangle" style={triangleStyle} />
                <div className="dropdown_filler" style={triangleStyle} />
                <div className="dropdown_main">
                    {children}
                </div>
            </div>
        );
    }
}

Dropdown.propTypes = {
    type: React.PropTypes.string.isRequired
}

function mapStateToProps(state) {
    return {
        app: new App(state)
    }
}

export default connect(mapStateToProps)(Dropdown);

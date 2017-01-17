import React from 'react'
import startCase from 'lodash/startCase'

import Icon from './Icon.react'

class Select extends React.Component {

    constructor(props) {
        super(props);
        
        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(e) {
        this.props.onChange(e.target.value)
    }

    render() {
        const { values, selected, className } = this.props

        return (
            <div className={`select ${className || ''}`}>
                {(v => startCase(v))(selected)}
                <Icon type="arrow-drop-down" />
                <select value={selected} onChange={this.handleChange}>
                    {values.map(v => <option key={v} value={v}>{startCase(v)}</option>)}
                </select>
            </div>
        )
    }
}

Select.propTypes = {
    selected: React.PropTypes.string.isRequired,
    values: React.PropTypes.array.isRequired,
    onChange: React.PropTypes.func.isRequired,
    className: React.PropTypes.string
}

export default Select
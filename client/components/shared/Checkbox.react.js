import React from 'react'

import Icon from './Icon.react'

class Checkbox extends React.Component {

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(e) {
        const { onChange } = this.props 
        if (typeof onChange === 'function') {
            onChange(e.target.checked)
        }
    }

    render() {
        const { checked, label } = this.props
        const checkedClass = checked ? 'checkbox-checked' : '';

        return (
            <label className={`checkbox ${checkedClass}`}>
                <input type="checkbox" checked={checked} onChange={this.handleChange} />
                { checked ? <Icon type="check-box" /> : <Icon type="check-box-outline" />}
                <span className="checkbox_label">{label}</span>
            </label>
        )
    }

}

Checkbox.propTypes = {
    checked: React.PropTypes.bool.isRequired,
    onChange: React.PropTypes.func,
    label: React.PropTypes.string
}

export default Checkbox;
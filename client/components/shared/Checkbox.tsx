import * as React from 'react'
import Icon from './Icon'

interface Props {
    checked: boolean
    label: string    
    onChange?: (checked: boolean) => void
}

class Checkbox extends React.Component<Props> {

    constructor(props: Props) {
        super(props);

        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(e: React.FormEvent<HTMLInputElement>) {
        const { onChange } = this.props 
        if (typeof onChange === 'function') {
            onChange((e.target as HTMLInputElement).checked)
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

export default Checkbox;
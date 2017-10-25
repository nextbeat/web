import * as React from 'react'
import startCase from 'lodash-es/startCase'

import Icon from '@components/shared/Icon'

interface Props {
    selected: string
    values: string[]
    onChange: (value: string) => void
    className?: string
}
class Select extends React.Component<Props> {

    constructor(props: Props) {
        super(props);
        
        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(e: React.FormEvent<HTMLSelectElement>) {
        this.props.onChange(e.currentTarget.value)
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

export default Select
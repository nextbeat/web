import * as React from 'react';

interface Props {
    enabled: boolean
    className?: string
    onClick?: () => void
}

class Switch extends React.Component<Props> {

    static defaultProps: Partial<Props> = {
        onClick: () => {}
    }

    render() {
        const { enabled, onClick, className } = this.props;
        const enabledClass = enabled ? 'enabled' : ''

        return (
            <div className={`switch ${enabledClass} ${className || ''}`} onClick={onClick}>
                <div className="switch_inner">
                    <div className="switch_background">
                        <div className="switch_scrubber" />
                    </div>
                </div>
            </div>
        )
    }

}

export default Switch;
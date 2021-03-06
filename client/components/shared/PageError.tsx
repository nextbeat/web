import * as React from 'react'
import Icon from '@components/shared/Icon'

class PageError extends React.Component {

    render() {
        const children = this.props.children || <span>Could not load page.</span>;
        return (
            <div className="page-error">
                <Icon type="sad-face" />
                <div className="page-error_content">{children}</div>
            </div>
        );
    }
}

export default PageError;

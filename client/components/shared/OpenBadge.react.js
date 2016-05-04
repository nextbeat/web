import React from 'react';

class OpenBadge extends React.Component {

    render() {
        const styles = (this.props.type || "").split(" ");
        const stylesClass = styles.map(s => `${s}_badge-open`).join(" ");
        return <div className={`badge-open ${stylesClass}`}>OPEN</div>;
    }
}

export default OpenBadge;

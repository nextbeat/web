import React from 'react';

class Badge extends React.Component {

    render() {
        // type is appended to badge (e.g. badge-open)
        // elementType is prepended to badge (e.g. item-room_badge)
        const { elementType, type, children } = this.props;
        const typeClass = type ? type.split(" ").map(s => `badge-${s}`).join(" ") : "";
        const elementTypeClass = elementType ? elementType.split(" ").map(s => `${s}_badge`).join(" ") : "";

        let text = '';
        switch (type) {
            case 'open':
                text = 'OPEN';
                break;
            case 'new':
            default:
                text = 'NEW';
        }
        text = children || text;

        return <div className={`badge ${typeClass} ${elementTypeClass}`}>{text}</div>;
    }
}

export default Badge;

import React from 'react';

class Spinner extends React.Component {

    render() {
        const styles = (this.props.type || "").split(" ");
        const stylesClass = styles.map(s => `spinner-${s}`).join(" ");
        return (<div className={`spinner ${stylesClass}`}>
            <div><div></div></div>
            <div><div></div></div>
            <div><div></div></div>
            <div><div></div></div>
            <div><div></div></div>
            <div><div></div></div>
            <div><div></div></div>
            <div><div></div></div>
        </div>
        );
    }
}

export default Spinner;

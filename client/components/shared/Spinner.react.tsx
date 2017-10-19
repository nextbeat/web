import * as  React from 'react'

type SpinnerType = 'grey' | 'white' | 'faded' | 'large' | 'small'

interface Props {
    styles: SpinnerType[]
    type?: string
}

class Spinner extends React.Component<Props> {

    render() {
        const stylesClass = `${this.props.styles.map(s => `spinner-${s}`).join(" ")} ${this.props.type ? this.props.type : ''}`
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

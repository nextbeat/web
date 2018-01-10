import * as React from 'react'

class Contact extends React.Component {

    render() {
        return (
            <div className="contact">
                { this.props.children }
                <div className="contact_direct">
                    <div className="contact_direct_title">CONTACT US DIRECTLY</div>
                    <div className="contact_direct_options">
                        <div className="contact_direct_option">
                            <div className="contact_direct_option_label">EMAIL</div>
                            <a className="contact_direct_option_value" href="mailto:team@nextbeat.co">team@nextbeat.co</a>
                        </div>
                        <div className="contact_direct_option">
                            <div className="contact_direct_option_label">PHONE</div>
                            <div className="contact_direct_option_value">484.639.7694</div>
                        </div>
                        <div className="contact_direct_option">
                            <div className="contact_direct_option_label">ADDRESS</div>
                            <div className="contact_direct_option_value">
                                3238 Casitas Ave <br />
                                Los Angeles, CA 90039
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Contact;
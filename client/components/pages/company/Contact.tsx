import * as React from 'react';

class Contact extends React.Component {
    render() {
        return (
            <div className="contact">
                <div className="contact_main">
                    <div className="contact_title">Contact Us</div>
                    <div className="contact_text">Fill out the form below and we’ll get back to you as soon as we can.</div>
                    <form className="contact_form">
                        <div className="contact_form_fields">
                            <div className="contact_form_field">
                                <label htmlFor="contact_form_name">Name</label>
                                <input type="text" id="contact_form_name" />
                            </div>
                            <div className="contact_form_field">
                                <label htmlFor="contact_form_email">Email</label>
                                <input type="text" id="contact_form_email" />
                            </div>
                            <div className="contact_form_field">
                                <label htmlFor="contact_form_phone">Phone</label>
                                <input type="text" id="contact_form_phone" />
                            </div>
                            <div className="contact_form_field">
                                <label htmlFor="contact_form_company">Company</label>
                                <input type="text" id="contact_form_company" />
                            </div>
                        </div>
                        <label htmlFor="contact_form_message">Message</label>
                        <textarea id="contact_form_message" />
                        <div className="contact_form_submit_wrapper">
                            <a className="contact_form_submit">Submit</a>
                        </div>
                    </form>
                </div>
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
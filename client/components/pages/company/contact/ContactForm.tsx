import * as React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import { submitContactMessage } from '@actions/pages/company'
import Company from '@models/state/pages/company'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    isSubmitting: boolean
    hasSubmitted: boolean
    error: string
}

type Props = ConnectProps & DispatchProps

interface ComponentState {
    name?: string
    email?: string
    phone?: string
    company?: string
    message?: string

    isInvalid: boolean
}

class ContactForm extends React.Component<Props, ComponentState> {

    constructor(props: Props) {
        super(props)

        this.handleInputChange = this.handleInputChange.bind(this)
        this.submit = this.submit.bind(this)

        this.state = {
            isInvalid: false
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (!prevProps.hasSubmitted && this.props.hasSubmitted) {
            browserHistory.push('/company/contact/success')
        }
    }

    handleInputChange(e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const input = e.currentTarget.name as any
        const value = e.currentTarget.value
        this.setState({ [input]: value.length > 0 ? value : undefined })
    }

    submit(e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();

        const { name, email, phone, company, message } = this.state
        const { dispatch, isSubmitting } = this.props

        if (isSubmitting) {
            return;
        }

        const isMissingRequiredField = !name || !email || !message
        this.setState({ isInvalid: isMissingRequiredField })

        if (isMissingRequiredField) {
            return;
        } else {
            this.props.dispatch(submitContactMessage({ name, email, phone, company, message }))
        }
    }

    render() {
        const { isInvalid } = this.state
        const { error, isSubmitting } = this.props
        return (
            <div className="contact_main">
                <div className="contact_title">Contact Us</div>
                <div className="contact_text">Fill out the form below and we’ll get back to you as soon as we can.</div>
                <form className="contact_form">
                    <div className="contact_form_fields">
                        <div className="contact_form_field">
                            <label htmlFor="contact_form_name">Name <i>required</i></label>
                            <input type="text" id="contact_form_name" name="name" onChange={this.handleInputChange} />
                        </div>
                        <div className="contact_form_field">
                            <label htmlFor="contact_form_email">Email <i>required</i></label>
                            <input type="text" id="contact_form_email" name="email" onChange={this.handleInputChange} />
                        </div>
                        <div className="contact_form_field">
                            <label htmlFor="contact_form_phone">Phone</label>
                            <input type="text" id="contact_form_phone" name="phone" onChange={this.handleInputChange} />
                        </div>
                        <div className="contact_form_field">
                            <label htmlFor="contact_form_company">Company</label>
                            <input type="text" id="contact_form_company" name="company" onChange={this.handleInputChange} />
                        </div>
                    </div>
                    <label htmlFor="contact_form_message">Message <i>required</i></label>
                    <textarea id="contact_form_message" name="message" onChange={this.handleInputChange} />
                    <div className="contact_form_submit_wrapper">
                        { error && !isInvalid && 
                            <span className="contact_form_submit_invalid">
                                Error submitting your message. Please try again.
                            </span> 
                        }
                        { isInvalid && 
                            <span className="contact_form_submit_invalid">
                                Please fill out all required fields.
                            </span> 
                        }
                        <a className="contact_form_submit" onClick={this.submit}>Submit</a>
                    </div>
                </form>
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        isSubmitting: Company.get(state, 'isSubmittingContactMessage'),
        hasSubmitted: Company.get(state, 'hasSubmittedContactMessage'),
        error: Company.get(state, 'contactMessageError')
    }
}

export default connect(mapStateToProps)(ContactForm);
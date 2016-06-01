import React from 'react'
import { connect } from 'react-redux'
import ScrollComponent from './utils/ScrollComponent.react'

import { loadSection, clearSection } from '../actions'
import { Section } from '../models'
import LargeStackItem from './shared/LargeStackItem.react'
import Spinner from './shared/Spinner.react'
import AppBanner from './shared/AppBanner.react'

class SectionComponent extends React.Component {

    componentDidMount() {
        const { dispatch, params: { slug } } = this.props 
        dispatch(loadSection(slug))
    }

    componentWillUnmount() {
        this.props.dispatch(clearSection())
    }

    render() {
        const { section } = this.props
        return (
            <div className="section content" id="section">
                <AppBanner />
                <div className="section_inner">
                    { section.get('name') && 
                    <div className="section_header">
                        { section.get('name') }
                        { section.get('description') && <div className="section_description">{ section.get('description') }</div> }
                    </div>
                    }
                    <div className="section_rooms">
                        { section.stacks().map(stack => <LargeStackItem key={`ss${stack.get('id')}`} stack={stack} />) }
                        { section.get('isFetching') && <Spinner type="grey large section" /> }
                    </div>
                </div>
            </div>
        )
    }
}

const scrollOptions = {

    onScrollToBottom: function() {
        const { dispatch, section } = this.props
        if (!section.get('isFetching') && section.stacks().size > 0) {
            dispatch(loadSection())
        }
    }
}

function mapStateToProps(state) {
    return {
        section: new Section(state)
    }
}

export default connect(mapStateToProps)(ScrollComponent('section', scrollOptions)(SectionComponent))

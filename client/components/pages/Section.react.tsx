import * as Promise from 'bluebird'
import * as React from 'react'
import { connect, Dispatch, DispatchProp } from 'react-redux'
import Helmet from 'react-helmet'
import ScrollComponent from '../utils/ScrollComponent.react'
import { List } from 'immutable'

import { loadSection, clearSection } from '@actions/pages/section'
import { Store, State, DispatchProps, RouteProps, ServerRenderingComponent, staticImplements } from '@types'
import Section from '@models/state/pages/section'
import StackEntity from '@models/entities/stack'
import LargeStackItem from '@components/shared/LargeStackItem.react'
import Spinner from '@components/shared/Spinner.react'
import AppBanner from '@components/shared/AppBanner.react'

interface Props {
    stacks: List<StackEntity>
    name: string
    description: string
    isFetching: boolean
}

interface Params {
    slug: string
}

@staticImplements<ServerRenderingComponent>()
class SectionComponent extends React.Component<Props & DispatchProps & RouteProps<Params>> {

    static fetchData(store: Store, params: { slug: string }) {
        return new Promise((resolve, reject) => {

            const unsubscribe = store.subscribe(() => {
                const state = store.getState()
                    if (Section.isLoaded(state)) {
                        unsubscribe()
                        resolve(store)
                    }
                    if (Section.get(state, 'error')) {
                        unsubscribe()
                        reject(new Error('Profile does not exist.'))
                    }
                })
            store.dispatch(loadSection(params.slug))
        })
    }

    componentDidMount() {
        const { dispatch, params: { slug } } = this.props 
        dispatch(loadSection(slug))
    }

    componentWillUnmount() {
        const { dispatch, params: { slug } } = this.props
        dispatch(clearSection(slug))
    }

    render() {
        const { name, params: { slug }, description, stacks, isFetching } = this.props

        return (
            <div className="section content" id="section">
                <Helmet
                    title={name}
                    meta={[
                        {"property": "al:ios:url", "content": `nextbeat://sections/${slug}`}
                    ]}
                />
                <AppBanner url={`nextbeat://sections/${slug}`}/>
                <div className="content_inner section_inner">
                    { name && 
                    <div className="section_header">
                        { name }
                        { description && <div className="section_description">{ description }</div> }
                    </div>
                    }
                    <div className="section_rooms">
                        { stacks.map(stack => <LargeStackItem key={`ss${stack.get('id')}`} stack={stack} />) }
                        { isFetching && <Spinner type="section" styles={["grey", "large"]} /> }
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

function mapStateToProps(state: State): Props {
    return {
        stacks: Section.stacks(state),
        name: Section.get(state, 'name'),
        description: Section.get(state, 'description'),
        isFetching: Section.get(state, 'isFetching'),
    }
}

export default connect(mapStateToProps)(ScrollComponent('section', scrollOptions)(SectionComponent))

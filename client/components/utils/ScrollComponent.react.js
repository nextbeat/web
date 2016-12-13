import React from 'react'
import hoistStatics from 'hoist-non-react-statics'
import shallowCompare from 'react-addons-shallow-compare'

/**
 * Higher order component enabling scroll-dependent behavior
 * on the given child component.
 */
export default function ScrollComponent(domId, scrollOptions={}) {

    const { 
        onScrollToTop,
        onScrollToBottom,
        onComponentWillReceiveProps,
        onComponentDidUpdate
    } = scrollOptions

    return function wrapWithScroll(ChildComponent) {

        class ScrollContainer extends React.Component {

            constructor(props) {
                super(props)

                // Keeps track of the scroll state when the props were last updated
                this.state = {
                    scrollTop: 0,
                    scrollHeight: 0
                }

                this.domElement = this.domElement.bind(this)

                this.handleScroll = this.handleScroll.bind(this)
                this.scrollToBottomIfPreviouslyAtBottom = this.scrollToBottomIfPreviouslyAtBottom.bind(this)
                this.scrollToTopIfPreviouslyAtTop = this.scrollToTopIfPreviouslyAtTop.bind(this)
                this.keepScrollPosition = this.keepScrollPosition.bind(this)
            }

            domElement() {
                if (typeof domId === 'function') {
                    return document.getElementById(domId(this.props))
                } else {
                    return document.getElementById(domId)
                }
            }

            // Component lifecycle methods

            componentDidMount() {
                $(this.domElement()).on('scroll', this.handleScroll)
            }

            componentWillReceiveProps(nextProps) {
                if (typeof onComponentWillReceiveProps === 'function') {
                    onComponentWillReceiveProps.call(this.refs.child, this, nextProps)
                }
                this.setScrollState()
            }

            componentDidUpdate(prevProps) {
                if (typeof onComponentDidUpdate === 'function') {
                    onComponentDidUpdate.call(this.refs.child, this, prevProps)
                }
            }

            componentWillUnmount() {
                $(this.domElement()).off('scroll', this.handleScroll)
            }

            // Scroll UI logic

            isScrolledToTop() {
                const elem = this.domElement();
                return elem.scrollTop === 0;
            }

            isScrolledToBottom() {
                const elem = this.domElement();
                return elem.scrollHeight - elem.clientHeight <= elem.scrollTop + 1;
            }

            isStateScrolledToTop() {
                return state.scrollTop === 0;
            }

            isStateScrolledToBottom() {
                const elem = this.domElement();
                return this.state.scrollHeight - elem.clientHeight <= this.state.scrollTop + 1;
            }

            setScrollState() {
                const elem = this.domElement();
                this.setState({
                    scrollTop: elem.scrollTop,
                    scrollHeight: elem.scrollHeight
                })
            }

            handleScroll() {
                if (this.isScrolledToTop() && typeof onScrollToTop === "function") {
                    onScrollToTop.call(this.refs.child, this)
                }
                if (this.isScrolledToBottom() && typeof onScrollToBottom === "function") {
                    onScrollToBottom.call(this.refs.child, this)
                }
            }

            // Actions

            scrollToBottom() {
                const elem = this.domElement();
                elem.scrollTop = elem.scrollHeight - elem.clientHeight;
            }

            scrollToTop() {
                const elem = this.domElement();
                elem.scrollTop = 0;
            }

            scrollToBottomIfPreviouslyAtBottom() {
                if (this.isStateScrolledToBottom()) {
                    this.scrollToBottom()
                }
            }

            scrollToTopIfPreviouslyAtTop() {
                if (this.isStateScrolledToTop()) {
                    this.scrollToTop()
                }
            }

            keepScrollPosition() {
                const elem = this.domElement();
                let heightDiff = elem.scrollHeight - this.state.scrollHeight;
                elem.scrollTop = elem.scrollTop + heightDiff;
            }

            // Render

            render() {
                return <ChildComponent {...this.props} {...this.state} ref='child' />
            }

        }

        return hoistStatics(ScrollContainer, ChildComponent);
    }

}
import * as React from 'react'
import hoistStatics from 'hoist-non-react-statics'

interface ScrollOptions<P> {
    onScrollToTop: (scrollComponent: React.Component) => void
    onScrollToBottom: (scrollComponent: React.Component) => void
    onComponentDidMount: (scrollComponent: React.Component, props: P) => void
    onComponentWillReceiveProps: (scrollComponent: React.Component, props: P) => void
    onComponentDidUpdate: (scrollComponent: React.Component, props: P) => void
    onResize: (scrollComponent: React.Component, props: P) => void
}

interface ScrollComponentState {
    scrollTop: number
    scrollHeight: number
}

export interface ScrollProps {
    scrollToTop: () => void
    scrollToBottom: () => void 
}

/**
 * Higher order component enabling scroll-dependent behavior
 * on the given child component.
 */
export default function ScrollComponent<P>(domId: ((props: P) => string) | string, scrollOptions: Partial<ScrollOptions<P>>) {

    const { 
        onScrollToTop,
        onScrollToBottom,
        onComponentDidMount,
        onComponentWillReceiveProps,
        onComponentDidUpdate,
        onResize
    } = scrollOptions

    return function wrapWithScroll(ChildComponent: React.ComponentType<any>) {

        class ScrollContainer extends React.Component<P, ScrollComponentState> {

            constructor(props: P) {
                super(props)

                // Keeps track of the scroll state when the props were last updated
                this.state = {
                    scrollTop: 0,
                    scrollHeight: 0
                }

                this.domElement = this.domElement.bind(this)

                this.handleScroll = this.handleScroll.bind(this)
                this.handleResize = this.handleResize.bind(this)

                this._doScroll = this._doScroll.bind(this)
                this.scrollToTop = this.scrollToTop.bind(this)
                this.scrollToBottom = this.scrollToBottom.bind(this)
                this.scrollToElementWithId = this.scrollToElementWithId.bind(this)
                this.scrollToTopIfPreviouslyAtTop = this.scrollToTopIfPreviouslyAtTop.bind(this)
                this.scrollToBottomIfPreviouslyAtBottom = this.scrollToBottomIfPreviouslyAtBottom.bind(this)
                this.keepScrollPosition = this.keepScrollPosition.bind(this)
            }

            domIdString(): string {
                return typeof domId === 'function' ? domId(this.props) : domId
            }

            domElement(): HTMLElement {
                return document.getElementById(this.domIdString()) as HTMLElement
            }

            // Component lifecycle methods

            componentDidMount() {
                $(this.domElement()).on('scroll', this.handleScroll)
                $(window).on(`resize.${this.domIdString()}`, this.handleResize)

                if (typeof onComponentDidMount === 'function') {
                    onComponentDidMount.call(this.refs.child, this, this.props)
                }
            }

            componentWillReceiveProps(nextProps: P) {
                if (typeof onComponentWillReceiveProps === 'function') {
                    onComponentWillReceiveProps.call(this.refs.child, this, nextProps)
                }
            }

            componentDidUpdate(prevProps: P) {
                if (typeof onComponentDidUpdate === 'function') {
                    onComponentDidUpdate.call(this.refs.child, this, prevProps)
                }
            }

            componentWillUnmount() {
                $(this.domElement()).off('scroll', this.handleScroll)
                $(window).off(`resize.${this.domIdString()}`)
            }

            // Other events

            handleResize() {
                // child unmounts before parent, so we need to 
                // check that the child is still around
                if (typeof onResize === 'function' && this.refs.child) {
                    onResize.call(this.refs.child, this, this.props)
                }
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
                return this.state.scrollTop === 0;
            }

            isStateScrolledToBottom() {
                const elem = this.domElement();
                return this.state.scrollHeight - elem.clientHeight <= this.state.scrollTop + 5;
            }

            setScrollState() {
                const elem = this.domElement();
                this.setState({
                    scrollTop: elem.scrollTop,
                    scrollHeight: elem.scrollHeight
                })
            }

            handleScroll() {
                this.setScrollState()
                if (this.isScrolledToTop() && typeof onScrollToTop === "function") {
                    onScrollToTop.call(this.refs.child, this)
                }
                if (this.isScrolledToBottom() && typeof onScrollToBottom === "function") {
                    onScrollToBottom.call(this.refs.child, this)
                }
            }

            // Actions
            
            _doScroll(top: number, duration: number) {
                const elem = this.domElement();
                if (duration > 0) {
                    $(elem).animate({ scrollTop: top }, {
                        duration,
                        complete: () => {
                            this.setScrollState();
                        },
                        easing: ($ as any).bez([0, 0, 0.2, 1]) // ease in
                    })
                } else {
                    elem.scrollTop = top;
                    this.setScrollState();
                }
            }

            scrollToBottom(duration=0) {
                const elem = this.domElement();
                const newTop = elem.scrollHeight - elem.clientHeight;
                this._doScroll(newTop, duration);
            }

            scrollToTop(duration=0) {
                this._doScroll(0, duration);
            }

            scrollToElementWithId(id: string, duration=0) {
                // sets element in center of scroll container
                const containerElem = this.domElement();
                const elem = document.getElementById(id);
                if (elem) {
                    const newTop = Math.max(1, elem.offsetTop - containerElem.clientHeight/2);
                    this._doScroll(newTop, duration);
                }
            }

            scrollToBottomIfPreviouslyAtBottom() {
                if (this.isStateScrolledToBottom()) {
                    this.scrollToBottom();
                }
                this.setScrollState();
            }

            scrollToTopIfPreviouslyAtTop() {
                if (this.isStateScrolledToTop()) {
                    this.scrollToTop();
                }
                this.setScrollState();
            }

            keepScrollPosition() {
                const elem = this.domElement();
                let heightDiff = elem.scrollHeight - this.state.scrollHeight;
                elem.scrollTop = elem.scrollTop + heightDiff;
            }

            // Render

            render() {
                const scrollProps = {
                    scrollToTop: this.scrollToTop,
                    scrollToBottom: this.scrollToBottom
                }
                return <ChildComponent {...this.props} {...this.state} {...scrollProps} ref='child' />
            }

        }

        return hoistStatics(ScrollContainer, ChildComponent);
    }

}
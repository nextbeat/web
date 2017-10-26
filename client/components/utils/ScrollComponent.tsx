import * as React from 'react'
import hoistStatics from 'hoist-non-react-statics'

interface ScrollOptions {
    onScrollToTop: () => void
    onScrollToBottom: () => void
}

interface ScrollComponentState {
    scrollTop: number
    scrollHeight: number
}

export interface ScrollComponentProps {    
    scrollTop: number
    scrollHeight: number

    isScrolledToTop: () => boolean
    isScrolledToBottom: () => boolean

    keepScrollPosition: () => void
    setScrollState: () => void

    scrollToTop: (duration?: number) => void
    scrollToBottom: (duration?: number) => void 
    scrollToBottomIfPreviouslyAtBottom: () => void    
    scrollToElementWithId: (id: string, duration?: number) => void
}

/**
 * Higher order component enabling scroll-dependent behavior
 * on the given child component.
 */
export default function ScrollComponent<OriginalProps extends {}>(domId: ((props: OriginalProps) => string) | string, scrollOptions: Partial<ScrollOptions> = {}) {

    const { 
        onScrollToTop,
        onScrollToBottom,
    } = scrollOptions

    // to do: make external props?

    return function wrapWithScroll(ChildComponent: React.ComponentClass<ScrollComponentProps & OriginalProps>) {

        class ScrollContainer extends React.Component<OriginalProps, ScrollComponentState> {

            constructor(props: OriginalProps) {
                super(props)

                // Keeps track of the scroll state when the props were last updated
                this.state = {
                    scrollTop: 0,
                    scrollHeight: 0
                }

                this.domElement = this.domElement.bind(this)

                this.handleScroll = this.handleScroll.bind(this)

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
                    onScrollToTop.call(this.refs.child)
                }
                if (this.isScrolledToBottom() && typeof onScrollToBottom === "function") {
                    onScrollToBottom.call(this.refs.child)
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
                const scrollProps: ScrollComponentProps = {
                    scrollToTop: this.scrollToTop,
                    scrollToBottom: this.scrollToBottom,

                    scrollHeight: this.state.scrollHeight,
                    scrollTop: this.state.scrollTop,

                    isScrolledToTop: this.isScrolledToTop,
                    isScrolledToBottom: this.isScrolledToBottom,
                    keepScrollPosition: this.keepScrollPosition,
                    setScrollState: this.setScrollState,
                    scrollToBottomIfPreviouslyAtBottom: this.scrollToBottomIfPreviouslyAtBottom,
                    scrollToElementWithId: this.scrollToElementWithId
                }

                return <ChildComponent {...scrollProps as any} {...this.props} />
            }

        }

        return hoistStatics(ScrollContainer, ChildComponent);
    }

}
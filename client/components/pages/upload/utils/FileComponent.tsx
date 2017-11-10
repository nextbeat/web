import * as React from 'react'
import hoistStatics from 'hoist-non-react-statics'
import assign from 'lodash-es/assign'

import { isBrowserCompatible, fileType } from '@upload'

interface FileComponentOptions {
    onImageLoad: (url: string, element: HTMLImageElement) => void
    onVideoLoad: (url: string, element: HTMLVideoElement) => void
}

interface ExternalProps {
    file?: File
}

export interface FileComponentProps {
    resourceLoaded: boolean
    resourceType: null | 'image' | 'video' | 'incompatible'
    resourceWidth: number
    resourceHeight: number
    resourceDuration?: number
    width: number
    height: number
    offsetX: number
    offsetY: number
}

export default function FileComponent(parentId: string, options: Partial<FileComponentOptions> = {}) {

    const {
        onImageLoad,
        onVideoLoad
    } = options

    // Calculate size and offset of resource based on
    // its intrinsic width and height and the dimensions
    // of its parent element
    function resourceDimensions(rWidth: number, rHeight: number) {
        const parent = $(document.getElementById(parentId) as HTMLElement)
        const pWidth = parent.width() || 0
        const pHeight = parent.height() || 1

        const rRatio = rWidth/rHeight
        const pRatio = pWidth/pHeight

        let width = 0,
            height = 0,
            offsetX = 0,
            offsetY = 0

        if (rRatio > pRatio) {
            height = pHeight
            width = rWidth * pHeight/rHeight
            offsetX = (pWidth - width)/2
        } else {
            width = pWidth;
            height = rHeight * pWidth/rWidth
            offsetY = (pHeight - height)/2
        }

        return { width, height, offsetX, offsetY }
    }

    return function wrap<OriginalProps>(ChildComponent: React.ComponentClass<FileComponentProps & OriginalProps>) {

        type FileContainerState = FileComponentProps
        type FileContainerProps = OriginalProps & ExternalProps

        class FileContainer extends React.Component<FileContainerProps, FileContainerState> {

            constructor(props: FileContainerProps) {
                super(props)

                this.loadResource = this.loadResource.bind(this)
                this.loadImage = this.loadImage.bind(this)
                this.loadVideo = this.loadVideo.bind(this)

                this.state = {
                    resourceLoaded: false,
                    resourceType: null,
                    resourceWidth: 0,
                    resourceHeight: 0,
                    resourceDuration: 0,
                    width: 0,
                    height: 0,
                    offsetX: 0,
                    offsetY: 0
                }
            }


            // Component lifecycle

            componentDidMount() {
                this.loadResource(this.props.file)
            }

            componentWillReceiveProps(nextProps: Readonly<FileContainerProps>) {
                if (this.props.file !== nextProps.file && !this.state.resourceLoaded) {
                    this.loadResource(nextProps.file)
                }

                if (this.props.file && !nextProps.file) {
                    // has cleared upload
                    this.setState({
                        resourceLoaded: false
                    })
                }
            }


            // Load

            loadResource(file?: File) {
                if (!file) {
                    return
                }

                if (!isBrowserCompatible(file)) {
                    this.setState({ resourceType: 'incompatible' })
                    return
                }
                
                let type = fileType(file)
                
                if (type === 'image') {
                    this.setState({ resourceType: 'image' })
                    this.loadImage(file)
                } else if (type === 'video') {
                    this.setState({ resourceType: 'video' })
                    this.loadVideo(file)
                }
            }

            loadImage(file: File) {
                const image = document.createElement('img')

                image.addEventListener('load', e => {
                    const imageTarget = e.target as HTMLImageElement
                    const width = imageTarget.width 
                    const height = imageTarget.height 

                    this.setState(assign({}, resourceDimensions(width, height), {
                        resourceLoaded: true,
                        resourceWidth: width,
                        resourceHeight: height
                    }))

                    if (typeof onImageLoad === 'function') {
                        // set timeout?
                        onImageLoad.call(this.refs.child, imageTarget.src, image)
                    }

                    URL.revokeObjectURL(imageTarget.src)
                })

                image.src = URL.createObjectURL(file)
            }

            loadVideo(file: File) {
                const video = document.createElement('video')

                video.addEventListener('loadeddata', e => {
                    let videoTarget = e.target as HTMLVideoElement
                    const width = videoTarget.videoWidth 
                    const height = videoTarget.videoHeight 
                    const duration = videoTarget.duration

                    this.setState(assign({}, resourceDimensions(width, height), {
                        resourceLoaded: true,
                        resourceWidth: width,
                        resourceHeight: height,
                        resourceDuration: duration
                    }))

                    if (typeof onVideoLoad === 'function') {
                        // set timeout?
                        onVideoLoad.call(this.refs.child, videoTarget.src, video)
                    }

                    URL.revokeObjectURL(video.src)
                })

                video.src = URL.createObjectURL(file)
            }


            // Render

            render() {
                return <ChildComponent {...this.props} {...this.state as any} ref="child" />
            }

        }

        return hoistStatics(FileContainer, ChildComponent);
    };


}
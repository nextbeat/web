import React from 'react'
import hoistStatics from 'hoist-non-react-statics'
import assign from 'lodash/assign'

import { Upload } from '../../../../models'

export default function FileComponent(parentId, options={}) {

    const {
        onImageLoad,
        onVideoLoad
    } = options

    // Calculate size and offset of resource based on
    // its intrinsic width and height and the dimensions
    // of its parent element
    function resourceDimensions(rWidth, rHeight) {
        const parent = $(document.getElementById(parentId))
        const pWidth = parent.width()
        const pHeight = parent.height()

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

    return function wrap(ChildComponent) {

        class FileContainer extends React.Component {

            constructor(props) {
                super(props)

                this.loadResource = this.loadResource.bind(this)
                this.loadImage = this.loadImage.bind(this)
                this.loadVideo = this.loadVideo.bind(this)

                this.state = {
                    resourceLoaded: false,
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
                if (this.props.file) {
                    this.loadResource(this.props.file)
                }
            }

            componentWillReceiveProps(nextProps) {
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

            loadResource(file) {
                const fileType = Upload.fileTypeForMimeType(file.type)
                if (fileType === 'image') {
                    this.loadImage(file)
                } else if (fileType === 'video') {
                    this.loadVideo(file)
                }
            }

            loadImage(file) {
                const image = document.createElement('img')

                image.addEventListener('load', e => {
                    const width = e.target.width 
                    const height = e.target.height 

                    this.setState(assign({}, resourceDimensions(width, height), {
                        resourceLoaded: true,
                        resourceWidth: width,
                        resourceHeight: height
                    }))

                    if (typeof onImageLoad === 'function') {
                        // set timeout?
                        onImageLoad.call(this.refs.child, e.target.src, image)
                    }

                    URL.revokeObjectURL(file)
                })

                image.src = URL.createObjectURL(file)
            }

            loadVideo(file) {
                const video = document.createElement('video')

                video.addEventListener('loadeddata', e => {
                    const width = e.target.videoWidth 
                    const height = e.target.videoHeight 
                    const duration = e.target.duration

                    this.setState(assign({}, resourceDimensions(width, height), {
                        resourceLoaded: true,
                        resourceWidth: width,
                        resourceHeight: height,
                        resourceDuration: duration
                    }))

                    if (typeof onVideoLoad === 'function') {
                        // set timeout?
                        onVideoLoad.call(this.refs.child, e.target.src, video)
                    }

                    URL.revokeObjectURL(file)
                })

                video.src = URL.createObjectURL(file)
            }


            // Render

            render() {
                return <ChildComponent {...this.props} {...this.state} ref="child" />
            }

        }


        FileContainer.propTypes = {
            file: React.PropTypes.object
        }

        return hoistStatics(FileContainer, ChildComponent);
    }


}
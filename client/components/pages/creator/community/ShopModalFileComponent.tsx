import * as React from 'react'

import FileComponent, { FileComponentProps } from '@components/utils/FileComponent'

interface OwnProps {
    file: File
    onImageLoad: (width: number, height: number) => void
}

type Props = OwnProps & FileComponentProps

class ShopModalFileComponent extends React.Component<Props> {

    constructor(props: Props) {
        super(props)
    }

    render() {
        return (
            <div id="shop-modal-file-component" />
        )
    }
}

const fileOptions = {
    onImageLoad: function(this: ShopModalFileComponent, src: string) {
        const { resourceWidth, resourceHeight, onImageLoad } = this.props
        onImageLoad(resourceWidth, resourceHeight)
    }
}

export default FileComponent('shop-modal-file-component', fileOptions)(ShopModalFileComponent)
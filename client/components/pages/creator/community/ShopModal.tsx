import * as React from 'react'
import { connect } from 'react-redux'

import ShopModalFileComponent from './ShopModalFileComponent'
import Modal from '@components/shared/Modal'
import Spinner from '@components/shared/Spinner'

import { closeModal } from '@actions/app'
import { uploadShopProduct, clearFileUpload } from '@actions/upload'
import { addShopProduct } from '@actions/pages/creator/community'
import App from '@models/state/app'
import Upload, { UploadType } from '@models/state/upload'
import Community from '@models/state/pages/creator/community'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    isActiveModal: boolean

    isUploading: boolean
    hasUploaded: boolean
    uploadUrl: string

    isAdding: boolean
}

type Props = ConnectProps & DispatchProps

interface ComponentState {
    file?: File
    error?: string
    fileWidth?: number
    fileHeight?: number

    title?: string
    url?: string
    price?: string
    description?: string
}

const MAX_FILE_SIZE = 200000

class ShopModal extends React.Component<Props, ComponentState> {

    constructor(props: Props) {
        super(props)

        this.validateFields         = this.validateFields.bind(this)
        this.clear                  = this.clear.bind(this)

        this.handleFileInputChange  = this.handleFileInputChange.bind(this)
        this.handleInputChange      = this.handleInputChange.bind(this)
        this.onImageLoad            = this.onImageLoad.bind(this)
        this.onSubmitClick          = this.onSubmitClick.bind(this)
        this.onSelectFileClick      = this.onSelectFileClick.bind(this)

        this.state = {}
    }

    /* Component lifecycle */

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.isActiveModal !== nextProps.isActiveModal) {
            this.clear()
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (!prevProps.hasUploaded && this.props.hasUploaded) {
            this.submit()
        }

        if (prevProps.isAdding && !this.props.isAdding) {
            this.props.dispatch(closeModal())
        }
    }

    componentWillUnmount() {
        this.clear()
    }

    /* Submission */

    validateFields(): boolean {
        const { file, title, url, price, fileWidth, fileHeight } = this.state
        let error: string | undefined;

        if (!file || !title || !url) {
            error = 'Must specify all required fields.'
        } else if (file.type !== 'image/jpeg' || file.size > MAX_FILE_SIZE) {
            error = 'File must be in .jpg format and under 200 KB.'
        } else if (!fileWidth || !fileHeight || fileWidth !== fileHeight) {
            error = 'Image width must equal image height.'
        } else if (price && !/^(\d+)(\.(\d+))?$/.test(price)) {
            error = 'Must specify proper price format.'
        }

        this.setState({ error })
        return !error
    }

    submit() {
        const { title, url, price, description, fileWidth, fileHeight } = this.state
        const { hasUploaded, uploadUrl, dispatch } = this.props

        if (!hasUploaded) {
            return
        }

        const shopProduct = {
            title: title!,
            url: url!,
            price,
            description,
            images: [{
                url: uploadUrl,
                width: fileWidth!,
                height: fileHeight!
            }]
        }

        dispatch(addShopProduct(shopProduct))
    }

    clear() {
        this.setState({
            file: undefined,
            error: undefined,
            fileWidth: undefined,
            fileHeight: undefined,
            title: undefined,
            url: undefined,
            price: undefined,
            description: undefined
        })
        this.props.dispatch(clearFileUpload(UploadType.ShopProduct))
    }

    /* Event handlers */

    handleFileInputChange(e: React.FormEvent<HTMLInputElement>) {
        if (e.currentTarget.files && e.currentTarget.files.length > 0) {
            const file = e.currentTarget.files[0]
            this.setState({ file })
        }
    }

    handleInputChange(e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const name = e.currentTarget.name as 'title' // to ignore typescript error
        const maxChars = ['description', 'url'].indexOf(name) > -1 ?  200 : 100
        this.setState({ [name]: e.currentTarget.value.substring(0, maxChars) })
    }

    onImageLoad(width: number, height: number) {
        this.setState({ fileWidth: width, fileHeight: height })
    }

    onSubmitClick() {
        if (this.validateFields()) {
            // TODO: Initiates upload process. Next step will be triggered
            // in componentWillReceiveProps; this isn't ideal.
            // Properly should be handled in middleware.
            this.props.dispatch(uploadShopProduct(this.state.file!))
        }
    }

    onSelectFileClick() {
        $('#add-shop-product_file-select').click()
    }

    render() {
        const { 
            file, 
            error,
            title,
            url,
            price,
            description 
        } = this.state 
        const { isAdding, isUploading } = this.props
        const isProcessing = isAdding || isUploading

        return (
            <Modal name="add-shop-product" className="modal-action">
                <input 
                    type="file" 
                    id="add-shop-product_file-select" 
                    className="upload_file-input" 
                    onChange={this.handleFileInputChange} 
                    accept="image/jpeg" 
                />
                <ShopModalFileComponent file={file} onImageLoad={this.onImageLoad} />
                <div className="modal_header">
                    Add product to shop
                </div>
                <div className="modal_input-wrapper modal_file-select">
                    <div className="btn" onClick={this.onSelectFileClick}>Select file</div>
                    { file && <div className="modal_file-select_name">{file.name}</div> }
                </div>
                <div className="modal_input-wrapper">
                    <input 
                        type="text" 
                        name="title" 
                        placeholder="Name" 
                        onChange={this.handleInputChange} 
                        value={title} 
                    />
                </div>
                <div className="modal_input-wrapper">
                    <input 
                        type="text" 
                        inputMode="url" 
                        name="url" 
                        placeholder="URL" 
                        onChange={this.handleInputChange} 
                        value={url} 
                    />
                </div>
                <div className="modal_input-wrapper">
                    <input 
                        type="text" 
                        inputMode="decimal" 
                        name="price" 
                        placeholder="Price (optional)" 
                        onChange={this.handleInputChange} 
                        value={price} 
                    />
                </div>
                <div className="modal_input-wrapper">
                    <textarea 
                        name="description" 
                        placeholder="Description (optional)" 
                        rows={3} 
                        onChange={this.handleInputChange} 
                        value={description} 
                    />
                </div>
                <div className="modal-action_submit-wrapper">
                    <a className="btn" onClick={this.onSubmitClick}>Submit</a>
                    { error && <div className="modal-action_submit_error">{ error }</div> }
                    { isProcessing && <Spinner styles={['grey']} /> }
                </div>
            </Modal>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        isActiveModal: App.get(state, 'activeModal') === 'add-shop-product',
        isUploading: Upload.isUploading(state, UploadType.ShopProduct),
        hasUploaded: Upload.isDoneUploading(state, UploadType.ShopProduct),
        uploadUrl: Upload.getInFile(state, UploadType.ShopProduct, 'url'),
        isAdding: Community.get(state, 'isAddingShopProduct')
    }
}

export default connect(mapStateToProps)(ShopModal)
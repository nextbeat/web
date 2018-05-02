import { Map } from 'immutable'
import ObjectModel from './base'

import { cloudfrontUrl } from '@upload'
import { joinUrls } from '@utils'

interface EmojiProps {
    id: number
    name: string
    url: string
}

export default class Emoji extends ObjectModel<EmojiProps> {
    url(): string {
        return joinUrls(cloudfrontUrl(), this.get('url'))
    }
}
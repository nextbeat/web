import { Schema, arrayOf } from 'normalizr'

const channel = new Schema('channels');
const stack = new Schema('stacks');
const user = new Schema('users');
const mediaItem = new Schema('mediaItems');
const comment = new Schema('comments');

stack.define({
    author: user
});

comment.define({
    author: user
})

export default {
    CHANNEL: channel,
    STACK: stack,
    STACKS: arrayOf(stack),
    MEDIA_ITEM: mediaItem,
    MEDIA_ITEMS: arrayOf(mediaItem),
    COMMENT: comment,
    COMMENTS: arrayOf(comment),
    USER: user
}
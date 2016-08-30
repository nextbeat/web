import { Schema, arrayOf } from 'normalizr'

const tag = new Schema('tags');
const stack = new Schema('stacks');
const user = new Schema('users');
const mediaItem = new Schema('mediaItems');
const comment = new Schema('comments');

stack.define({
    author: user,
    mediaItems: arrayOf(mediaItem)
});

comment.define({
    author: user
})

export default {
    TAG: tag,
    TAGS: arrayOf(tag),
    STACK: stack,
    STACKS: arrayOf(stack),
    MEDIA_ITEM: mediaItem,
    MEDIA_ITEMS: arrayOf(mediaItem),
    COMMENT: comment,
    COMMENTS: arrayOf(comment),
    USER: user,
    USERS: arrayOf(user)
}
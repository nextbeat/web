import { Schema, arrayOf } from 'normalizr'

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
    STACK: stack,
    MEDIA_ITEMS: arrayOf(mediaItem),
    COMMENTS: arrayOf(comment)
}
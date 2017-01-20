import { schema } from 'normalizr'

const tag = new schema.Entity('tags');
const mediaItem = new schema.Entity('mediaItems');
const user = new schema.Entity('users');
const stack = new schema.Entity('stacks', { author: user, mediaItems: [mediaItem] });
const comment = new schema.Entity('comments', { author: user });

export default {
    TAG: tag,
    TAGS: [ tag ],
    STACK: stack,
    STACKS: [ stack ],
    MEDIA_ITEM: mediaItem,
    MEDIA_ITEMS: [ mediaItem ],
    COMMENT: comment,
    COMMENTS: [ comment ],
    USER: user,
    USERS: [ user ]
}
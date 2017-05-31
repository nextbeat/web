import { schema } from 'normalizr'

const tag = new schema.Entity('tags');
const mediaItem = new schema.Entity('mediaItems');
const user = new schema.Entity('users');
const stack = new schema.Entity('stacks', { author: user, mediaItems: [mediaItem] });
const comment = new schema.Entity('comments', { author: user, recipient: user });
// Search results have an extra result_indices
// attribute, so we create a new schema to store
// them so that normal comments aren't polluted
// with that attribute (which could affect rendering)
const searchResultComment = new schema.Entity('searchResultComments', { author: user, recipient: user });

export default {
    TAG: tag,
    TAGS: [ tag ],
    STACK: stack,
    STACKS: [ stack ],
    MEDIA_ITEM: mediaItem,
    MEDIA_ITEMS: [ mediaItem ],
    COMMENT: comment,
    COMMENTS: [ comment ],
    SEARCH_RESULT_COMMENT: searchResultComment,
    SEARCH_RESULT_COMMENTS: [ searchResultComment ],
    USER: user,
    USERS: [ user ]
}
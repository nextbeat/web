import { schema } from 'normalizr'

const Tag = new schema.Entity('tags');
const User = new schema.Entity('users');
const MediaItem = new schema.Entity('mediaItems');
const Stack = new schema.Entity('stacks', { author: User, mediaItems: [ MediaItem ] });
const Comment = new schema.Entity('comments', { author: User, recipient: User, stack: Stack })
MediaItem.define({ references: Comment }); // handles circular reference

// Search results have an extra result_indices
// attribute, so we create a new schema to store
// them so that normal Comments aren't polluted
// with that attribute (which could affect rendering)
const SearchResultComment = new schema.Entity('searchResultComments', { author: User, recipient: User });

const Tags = [Tag]
const Users = [User]
const MediaItems = [MediaItem]
const Stacks = [Stack]
const Comments = [Comment]
const SearchResultComments = [SearchResultComment]

// todo: remove once migrated to ts
export default {
    TAG: Tag,
    TAGS: [ Tag ],
    STACK: Stack,
    STACKS: [ Stack ],
    MEDIA_ITEM: MediaItem,
    MEDIA_ITEMS: [ MediaItem ],
    COMMENT: Comment,
    COMMENTS: [ Comment ],
    SEARCH_RESULT_COMMENT: SearchResultComment,
    SEARCH_RESULT_COMMENTS: [ SearchResultComment ],
    USER: User,
    USERS: [ User ]
}

export { 
    Comment,
    Comments,
    MediaItem,
    MediaItems,
    SearchResultComment,
    SearchResultComments,
    Stack,
    Stacks,
    Tag,
    Tags,
    User,
    Users
}
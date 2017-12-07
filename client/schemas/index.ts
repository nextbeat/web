import { schema } from 'normalizr'

const Tag = new schema.Entity('tags');
const User = new schema.Entity('users');
const MediaItem = new schema.Entity('mediaItems');
const Stack = new schema.Entity('stacks', { author: User, mediaItems: [ MediaItem ] });
const Comment = new schema.Entity('comments', { author: User, recipient: User, stack: Stack })
const CampaignStack = new schema.Entity('campaignStacks')
const Campaign = new schema.Entity('campaigns', { stacks: [ CampaignStack ] })
const Ad = new schema.Entity('ad')
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
const CampaignStacks = [CampaignStack]
const Campaigns = [Campaign]
const SearchResultComments = [SearchResultComment]
const Ads = [Ad]

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
    Users,
    Campaign,
    Campaigns,
    CampaignStack,
    CampaignStacks,
    Ad,
    Ads
}
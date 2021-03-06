import { schema } from 'normalizr'

const Tag = new schema.Entity('tags');
const User = new schema.Entity('users');
const MediaItem = new schema.Entity('mediaItems');
const Stack = new schema.Entity('stacks', { author: User, mediaItems: [ MediaItem ] });
const Comment = new schema.Entity('comments', { stack: Stack })
const Ad = new schema.Entity('ads')
const ShopProduct = new schema.Entity('shopProducts')

// Analytics entities
const StatsStack = new schema.Entity('statsStacks')
const StatsUser = new schema.Entity('statsUsers', { stacks: [ StatsStack ]})
const CampaignStack = new schema.Entity('campaignStacks')
const Campaign = new schema.Entity('campaigns', { stacks: [ CampaignStack ] })

MediaItem.define({ references: Comment }); // handles circular reference

// Search results have an extra result_indices
// attribute, so we create a new schema to store
// them so that normal Comments aren't polluted
// with that attribute (which could affect rendering)
const SearchResultComment = new schema.Entity('searchResultComments');

// The shop schema does not directly map to an
// entity, but is used for normalizing the result
// of the ROOM_SHOP request.
const SponsoredProducts = new schema.Object({
    products: [ShopProduct]
})
const Shop = new schema.Object({
    sponsored_products: [SponsoredProducts],
    products: [ShopProduct]
})

const Tags = [Tag]
const Users = [User]
const MediaItems = [MediaItem]
const Stacks = [Stack]
const Comments = [Comment]
const SearchResultComments = [SearchResultComment]
const Ads = [Ad]
const ShopProducts = [ShopProduct]

const StatsStacks = [StatsStack]
const StatsUsers = [StatsUser]
const CampaignStacks = [CampaignStack]
const Campaigns = [Campaign]

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
    Ad,
    Ads,
    ShopProduct,
    ShopProducts,
    Shop,
    StatsStack,
    StatsStacks,
    StatsUser,
    StatsUsers,
    Campaign,
    Campaigns,
    CampaignStack,
    CampaignStacks,
}
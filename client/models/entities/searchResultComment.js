import Comment from './comment'

export default class SearchResultComment extends Comment {

    constructor(id, entities) {
        super(id, entities);
        this.entityName = "searchResultComments";
    }

}
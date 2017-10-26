import { List } from 'immutable'
import * as differenceInMinutes from 'date-fns/difference_in_minutes'

import Comment from '@models/entities/comment'

export default function commentReducer(res: List<Comment>, comment: Comment): List<Comment> {
    let isCollapsibleComment = (comment: Comment) => comment.get('type') === 'notification' && comment.get('subtype') === 'mediaitem';
    let isPublicMessage = (comment: Comment) => comment.get('type') === 'message' && comment.get('subtype') === 'public';
    let hasReference = (comment: Comment) => !!comment.get('is_referenced_by');
    
    let lastComment = res.last()
    if (lastComment && isCollapsibleComment(lastComment) && isCollapsibleComment(comment)) {
        // collapse into previous notification comment
        let count = lastComment.__count__ || 0
        comment.__count__ = count+1;
        return res.pop().push(comment);
    } 

    if (lastComment && isPublicMessage(lastComment) && isPublicMessage(comment) && !hasReference(comment)) {
        const sameAuthor = lastComment.author().get('username') === comment.author().get('username');
        const diff = differenceInMinutes(comment.get('created_at'), lastComment.get('created_at'));
        if (sameAuthor && diff < 10) {
            comment.__no_header__ = true;
        }
    }

    if (isCollapsibleComment(comment)) {
        comment.__count__ = 1;
    }

    return res.push(comment);
}
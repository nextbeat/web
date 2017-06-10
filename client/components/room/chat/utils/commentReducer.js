import differenceInMinutes from 'date-fns/difference_in_minutes'

export default function commentReducer(res, comment) {
    let isCollapsibleComment = (comment) => comment.get('type') === 'notification' && comment.get('subtype') === 'mediaitem';
    let isPublicMessage = (comment) => comment.get('type') === 'message' && comment.get('subtype') === 'public';
    
    if (res.last() && isCollapsibleComment(res.last()) && isCollapsibleComment(comment)) {
        // collapse into previous notification comment
        let count = res.last().__count__;
        comment.__count__ = count+1;
        return res.pop().push(comment);
    } 

    if (res.last() && isPublicMessage(res.last()) && isPublicMessage(comment)) {
        const sameAuthor = res.last().author().get('username') === comment.author().get('username');
        const diff = differenceInMinutes(comment.get('created_at'), res.last().get('created_at'));
        if (sameAuthor && diff < 10) {
            comment.__no_header__ = true;
        }
    }

    if (isCollapsibleComment(comment)) {
        comment.__count__ = 1;
    }

    return res.push(comment);
}
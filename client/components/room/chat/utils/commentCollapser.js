export default function commentCollapser(res, comment) {
    let isCollapsibleComment = (comment) => comment.get('type') === 'notification' && comment.get('subtype') === 'mediaitem';
    
    if (res.last() && isCollapsibleComment(res.last()) && isCollapsibleComment(comment)) {
        // collapse into previous notification comment
        let count = res.last().__count__;
        comment.__count__ = count+1;
        return res.pop().push(comment);
    } 

    if (isCollapsibleComment(comment)) {
        comment.__count__ = 1;
    }

    return res.push(comment);
}
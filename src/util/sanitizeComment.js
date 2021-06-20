/* eslint-disable no-param-reassign */
/**
 * Function to sanitize comment/annotation data and convert values from JSON to numbers
 * @param {Object} comment
 */
const sanitizeComment = (comment) => {
    if (comment.motivation === 'commenting') {
        comment.target.selector.node.index = Number(comment.target.selector.node.index);
        comment.target.selector.opacity = Number(comment.target.selector.opacity);
        for (let i = 0; i < comment.target.selector.boundingBox.length; i += 1) {
            comment.target.selector.boundingBox[i] = Number(comment.target.selector.boundingBox[i]);
        }
        if (comment.target.selector.quadPoints) {
            const arr = comment.target.selector.quadPoints;
            for (let i = 0; i < arr.length; i += 1) {
                arr[i] = Number(arr[i]);
            }
        }
        if (comment.target.selector.strokeWidth) {
            comment.target.selector.strokeWidth = Number(comment.target.selector.strokeWidth);
        }
        if (comment.target.selector.inkList) {
            const inkArr = comment.target.selector.inkList[0];
            for (let i = 0; i < inkArr.length; i += 1) {
                inkArr[i] = parseFloat(inkArr[i]);
            }
        }
    }
    return comment;
};

module.exports = sanitizeComment;

const express = require('express');
const BookReviewController = require('../../controllers/bookReview');
const validator = require('../../middlewares/validator');
const {
    tokenAuthorization,
    isUser,
} = require('../../middlewares/tokenValidator');

const router = express.Router();

router.post(
    '/create',
    [tokenAuthorization, isUser],
    validator.addProductReview,
    BookReviewController.createReview
);
// .get(
//     '/getReviewByProduct/:productId',
//     tokenAuthorization,
//     productReview.getReviewByProduct
// )
// .get(
//     '/getReviewByUser/:userId',
//     tokenAuthorization,
//     productReview.getReviewByUser
// )
// .delete(
//     '/deleteReview/:productId',
//     tokenAuthorization,
//     productReview.deleteReview
// );

exports.router = router;

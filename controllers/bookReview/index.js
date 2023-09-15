const { validationResult } = require('express-validator');
const HTTP_STATUS = require('../../constants/statusCode');
const databaseLogger = require('../../util/dbLogger');
const { sendResponse } = require('../../util/response');
const bookReviewModel = require('../../models/bookReview');
const bookModel = require('../../models/book');
const authModel = require('../../models/auth');
const userModel = require('../../models/user');

class BookReviewController {
    async createReview(req, res) {
        try {
            databaseLogger(req.originalUrl);

            const { book, message, rating } = req.body;
            const validation = validationResult(req).array();
            if (validation.length) {
                const error = {};
                validation.forEach((validationError) => {
                    const property = validationError.path;
                    error[property] = validationError.msg;
                });
                return sendResponse(
                    res,
                    HTTP_STATUS.UNPROCESSABLE_ENTITY,
                    'Unprocessable Entity',
                    error
                );
            }
            const bookFound = await bookModel.findById(book);
            const userFoundInAuth = await authModel.findById(req.user._id);
            const userFoundInUser = await userModel.findById(
                userFoundInAuth.user
            );
            if (!userFoundInAuth || !userFoundInUser) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'No user found'
                );
            }
            if (!bookFound) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'No book found'
                );
            }
            const bookExistInReview = await bookReviewModel.findOne({
                book: String(book),
            });
            if (!bookExistInReview) {
                const result = await bookReviewModel.create({
                    book,
                });

                result.reviews.push({
                    user: userFoundInUser,
                    message: message || '',
                    rating: rating,
                });

                await result.save();

                bookFound.reviews.push(result._id);
                await bookFound.save();

                if (result) {
                    return sendResponse(
                        res,
                        HTTP_STATUS.CREATED,
                        'Review added successfully',
                        result
                    );
                }
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'Something went wrong'
                );
            } else {
                const userRatingExist = bookExistInReview.reviews.findIndex(
                    (ele) => {
                        return String(ele.user) === String(userFoundInUser._id);
                    }
                );

                if (userRatingExist != -1) {
                    return sendResponse(
                        res,
                        HTTP_STATUS.BAD_REQUEST,
                        'You can not add more than one review'
                    );
                }

                bookExistInReview.reviews.push({
                    user: userFoundInUser,
                    message: message || '',
                    rating: rating,
                });

                await bookExistInReview.save();

                bookFound.reviews.push(bookExistInReview._id);
                await bookFound.save();

                if (bookExistInReview) {
                    return sendResponse(
                        res,
                        HTTP_STATUS.CREATED,
                        'Review added successfully',
                        bookExistInReview
                    );
                }
            }
        } catch (error) {
            console.log(error);
            databaseLogger(error.message);
            return sendResponse(
                res,
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                'Internal server error'
            );
        }
    }
}

module.exports = new BookReviewController();

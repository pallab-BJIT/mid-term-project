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
                const sum = result.reviews.reduce(
                    (accumulator, review) => accumulator + review.rating,
                    0
                );
                const avg = sum / result.reviews.length;

                bookFound.rating = avg;
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

                // bookFound.reviews.push(bookExistInReview._id);
                const sum = bookExistInReview.reviews.reduce(
                    (accumulator, review) => accumulator + review.rating,
                    0
                );
                const avg = sum / bookExistInReview.reviews.length;

                bookFound.rating = avg;
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

    async updateReview(req, res) {
        try {
            databaseLogger(req.originalUrl);
            const { message, rating } = req.body;
            const { bookId } = req.params;
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
            const bookFound = await bookModel.findById(bookId);
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
                book: bookId,
            });

            if (!bookExistInReview) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'Invalid book id for review'
                );
            }
            const userIdInReviews = bookExistInReview.reviews.findIndex(
                (ele) => {
                    return String(ele.user) === String(userFoundInUser._id);
                }
            );

            if (userIdInReviews === -1) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'Invalid user id for update review'
                );
            }

            bookExistInReview.reviews[userIdInReviews].message = message;

            if (rating) {
                bookExistInReview.reviews[userIdInReviews].rating = rating;
                const sum = bookExistInReview.reviews.reduce(
                    (accumulator, review) => accumulator + review.rating,
                    0
                );
                const avg = sum / bookExistInReview.reviews.length;

                bookFound.rating = avg;
                await bookFound.save();
            }
            await bookExistInReview.save();

            return sendResponse(
                res,
                HTTP_STATUS.ACCEPTED,
                'Successfully updated the review',
                bookExistInReview
            );
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

    async deleteReview(req, res) {
        try {
            databaseLogger(req.originalUrl);
            const { bookId } = req.params;
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
            const bookFound = await bookModel.findById(bookId);
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
                book: String(bookId),
            });

            if (!bookExistInReview) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'Invalid book id for delete review'
                );
            }
            const userIdInReviews = bookExistInReview.reviews.findIndex(
                (ele) => {
                    return String(ele.user) === String(userFoundInUser._id);
                }
            );

            if (userIdInReviews === -1) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'Invalid user id for delete review'
                );
            }
            bookExistInReview.reviews.splice(userIdInReviews, 1);
            await bookExistInReview.save();
            if (!bookExistInReview.reviews.length) {
                console.log('ffff');
                const deleteBookReview = await bookModel.findOneAndUpdate(
                    { _id: bookId },
                    { $unset: { reviews: 1 } },
                    { new: true }
                );
                bookFound.rating = 0;
                await bookFound.save();
                await bookReviewModel.findByIdAndDelete(bookExistInReview._id);
                return sendResponse(
                    res,
                    HTTP_STATUS.OK,
                    'Deleted review successfully'
                );
            }
            const sum = bookExistInReview.reviews.reduce(
                (accumulator, review) => accumulator + review.rating,
                0
            );
            const avg = sum / bookExistInReview.reviews.length;

            bookFound.rating = avg;
            console.log('hhhh', bookFound);
            await bookFound.save();
            await bookExistInReview.save();
            return sendResponse(
                res,
                HTTP_STATUS.OK,
                'Deleted review successfully'
            );
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

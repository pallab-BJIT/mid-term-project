const { validationResult } = require('express-validator');
const HTTP_STATUS = require('../../constants/statusCode');
const bookModel = require('../../models/book');
const DiscountPrice = require('../../models/discountPrice');
const databaseLogger = require('../../util/dbLogger');
const { sendResponse } = require('../../util/response');
const { sendValidationError } = require('../../util/validationErrorHelper');
const mongoose = require('mongoose');
const {
    Types: { ObjectId },
} = require('mongoose');
class DiscountPriceController {
    async getAllDiscount(req, res) {
        try {
            databaseLogger(req.originalUrl);
            const result = await DiscountPrice.find().populate('bookIds');
            if (result) {
                return sendResponse(
                    res,
                    HTTP_STATUS.OK,
                    'Successfully get all the data',
                    result
                );
            }
            return sendResponse(res, HTTP_STATUS.OK, 'No data found', []);
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
    async addDiscount(req, res) {
        try {
            databaseLogger(req.originalUrl);
            const validation = validationResult(req).array();

            if (validation.length) {
                return sendValidationError(res, validation);
            }
            const { discountPercentage, bookId, startDate, endDate, country } =
                req.body;

            const hasDuplicateBookIds = bookId.length !== new Set(bookId).size;

            if (hasDuplicateBookIds) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'Can not accept duplicate book id'
                );
            }

            const bookIdsToCheck = bookId.map(
                (bookId) => new mongoose.Types.ObjectId(bookId)
            );
            const bookAvailable = await bookModel.find({
                _id: { $in: bookIdsToCheck },
            });
            const availableCountry = ['BD', 'US', 'IND'];
            if (bookAvailable.length != bookId.length) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'Some of the book maybe not available'
                );
            }
            for (const ele of country) {
                const uppercaseCountry = ele.toUpperCase();

                if (!availableCountry.includes(uppercaseCountry)) {
                    return sendResponse(
                        res,
                        HTTP_STATUS.BAD_REQUEST,
                        'Some country maybe not available'
                    );
                }
            }

            const discountExistForBook = await DiscountPrice.find({
                bookIds: { $in: bookId },
            });

            if (discountExistForBook.length) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'Can not add multiple discount for a book'
                );
            }
            const currentDate = new Date();
            const newStartDate = new Date(startDate);
            const newEndDate = new Date(endDate);
            if (newEndDate < newStartDate) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'End date cannot be less than start date.'
                );
            }
            const daysUntilStartDate = Math.floor(
                (newStartDate - currentDate) / (1000 * 60 * 60 * 24)
            );

            if (daysUntilStartDate < -1) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'Start date cannot be less than today.'
                );
            } else {
                const daysDifference = Math.floor(
                    (newEndDate - newStartDate) / (1000 * 60 * 60 * 24)
                );

                if (daysDifference >= 5) {
                    return sendResponse(
                        res,
                        HTTP_STATUS.BAD_REQUEST,
                        'EndDate can not exceed 5 days from startDate'
                    );
                }
            }
            const discount = new DiscountPrice({
                discountPercentage,
                startDate,
                endDate,
                counties: country,
            });
            bookId.forEach((ele) => discount.bookIds.push(ele));
            await discount.save();
            const populateDiscount = await DiscountPrice.findById(
                discount._id
            ).populate('bookIds');
            if (discount) {
                return sendResponse(
                    res,
                    HTTP_STATUS.CREATED,
                    'Discount added successfully',
                    populateDiscount
                );
            }
            return sendResponse(
                res,
                HTTP_STATUS.BAD_REQUEST,
                'Something went wrong'
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

    async updateDiscount(req, res) {
        try {
            databaseLogger(req.originalUrl);

            const validation = validationResult(req).array();

            if (validation.length) {
                return sendValidationError(res, validation);
            }
            const { discountPercentage, bookId, startDate, endDate, country } =
                req.body;
            const { discountId } = req.params;

            if (!Object.keys(req.body).length) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'Can not accept empty data'
                );
            }
            if (bookId?.length) {
                const hasDuplicateBookIds =
                    bookId?.length !== new Set(bookId).size;
                if (hasDuplicateBookIds) {
                    return sendResponse(
                        res,
                        HTTP_STATUS.BAD_REQUEST,
                        'Can not accept duplicate book id'
                    );
                }
            }

            const bookIdsToCheck = bookId?.map(
                (bookId) => new mongoose.Types.ObjectId(bookId)
            );
            const bookAvailable = await bookModel.find({
                _id: { $in: bookIdsToCheck },
            });
            const availableCountry = ['BD', 'US', 'IND'];
            if (bookId?.length && bookAvailable?.length != bookId?.length) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'Some of the book maybe not available'
                );
            }
            if (country?.length) {
                for (const ele of country) {
                    const uppercaseCountry = ele.toUpperCase();

                    if (!availableCountry.includes(uppercaseCountry)) {
                        return sendResponse(
                            res,
                            HTTP_STATUS.BAD_REQUEST,
                            'Some country maybe not available'
                        );
                    }
                }
            }

            const discountExistForBook = await DiscountPrice.find({
                bookIds: { $in: bookId },
            });

            if (discountExistForBook.length) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'Can not add multiple discount for a book'
                );
            }
            const currentDate = new Date();
            const newStartDate = new Date(startDate);
            const newEndDate = new Date(endDate);
            if (newEndDate < newStartDate) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'End date cannot be less than start date.'
                );
            }
            const daysUntilStartDate = Math.floor(
                (newStartDate - currentDate) / (1000 * 60 * 60 * 24)
            );

            if (daysUntilStartDate < -1) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'Start date cannot be less than today.'
                );
            } else {
                const daysDifference = Math.floor(
                    (newEndDate - newStartDate) / (1000 * 60 * 60 * 24)
                );

                if (daysDifference >= 5) {
                    return sendResponse(
                        res,
                        HTTP_STATUS.BAD_REQUEST,
                        'EndDate can not exceed 5 days from startDate'
                    );
                }
            }

            const discountById = await DiscountPrice.findById(discountId);
            if (!discountById) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'No discount associated by this id'
                );
            }
            if (bookId?.length) {
                for (let ele of bookId) {
                    discountById.bookIds.push(ele);
                }
            }
            if (country?.length) {
                for (let i = 0; i < country.length; i++) {
                    if (!discountById.counties.includes(country[i])) {
                        discountById.counties.push(country[i]);
                    }
                }
            }
            if (discountPercentage) {
                discountById.discountPercentage = discountPercentage;
            }
            if (startDate) {
                discountById.startDate = startDate;
            }
            if (endDate) {
                discountById.endDate = endDate;
            }
            await discountById.save();
            if (!discountById) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'Something went wrong'
                );
            }
            return sendResponse(
                res,
                HTTP_STATUS.ACCEPTED,
                'Discount updated successfully',
                discountById
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

    async deleteDiscount(req, res) {
        try {
            const validation = validationResult(req).array();

            if (validation.length) {
                return sendValidationError(res, validation);
            }
            const { discountId } = req.params;
            const { bookId } = req.body;
            if (bookId?.length) {
                const hasDuplicateBookIds =
                    bookId?.length !== new Set(bookId).size;
                if (hasDuplicateBookIds) {
                    return sendResponse(
                        res,
                        HTTP_STATUS.BAD_REQUEST,
                        'Can not accept duplicate book id'
                    );
                }
            }
            const bookIdsToCheck = bookId?.map(
                (bookId) => new mongoose.Types.ObjectId(bookId)
            );
            const bookAvailable = await bookModel.find({
                _id: { $in: bookIdsToCheck },
            });

            if (bookId?.length && bookAvailable?.length != bookId?.length) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'Some of the book maybe not available'
                );
            }

            const discountById = await DiscountPrice.findById(discountId);

            if (!discountById) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'No discount associated by this id'
                );
            }
            if (bookId?.length) {
                let bookIdArray = [];
                discountById.bookIds.forEach((bookId) => {
                    bookIdArray.push(String(bookId));
                });
                for (const ele of bookId) {
                    if (!bookIdArray.includes(ele)) {
                        return sendResponse(
                            res,
                            HTTP_STATUS.BAD_REQUEST,
                            'Some book id maybe not available in the discount'
                        );
                    }
                }
                const result = await DiscountPrice.updateOne(
                    { _id: discountId },
                    { $pull: { bookIds: { $in: bookIdsToCheck } } },
                    { new: true }
                );
                if (!result.modifiedCount) {
                    return sendResponse(
                        res,
                        HTTP_STATUS.OK,
                        'Something went wrong'
                    );
                }
                const data = await DiscountPrice.findById(discountId);
                return sendResponse(
                    res,
                    HTTP_STATUS.OK,
                    'Book successfully removed from the discount',
                    data
                );
            }

            const result = await DiscountPrice.findByIdAndDelete(discountById);
            return sendResponse(
                res,
                HTTP_STATUS.OK,
                'Successfully deleted the discount',
                result
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

module.exports = new DiscountPriceController();
const HTTP_STATUS = require('../../constants/statusCode');
const bookModel = require('../../models/book');
const { sendResponse } = require('../../util/response');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

class BookController {
    async getAllBooks(req, res) {
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

        let page = parseInt(req.query.offset);
        let limit = parseInt(req.query.limit);

        let {
            search,
            sortBy,
            sortOrder,
            filter,
            filterOrder,
            filterValue,
            category,
        } = req.query;

        let baseQuery = bookModel.find();
        if (!search && !sortBy && !filter && !category) {
            const skip = (page - 1) * limit;

            const data = await bookModel.find({}).skip(skip).limit(limit);
            let totalCount = await bookModel.countDocuments();
            if (!page && !limit) {
                page = 1;
                limit = 30;
                totalCount = limit;
            } else {
                totalCount = await bookModel.countDocuments();
            }
            let totalPages = Math.ceil(totalCount / limit);
            const result = {
                currentPage: page,
                totalPages: totalPages,
                totalData: totalCount,
                products: data,
            };
            return sendResponse(
                res,
                HTTP_STATUS.OK,
                'Successfully get the books',
                result
            );
        }
        if (search && search?.length) {
            baseQuery = baseQuery.or([
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ]);
        }
        if (sortBy && sortBy?.length) {
            const sortField = sortBy;
            const sortDirection = sortOrder === 'desc' ? -1 : 1;
            baseQuery = baseQuery.sort({ [sortField]: sortDirection });
        }

        if (filter && filter?.length) {
            const filterField = filter;
            const filterObj = {};
            filterValue = parseInt(filterValue);
            if (filterOrder === 'high') {
                filterObj[filterField] = { $gte: filterValue };
            } else {
                filterObj[filterField] = { $lte: filterValue };
            }
            baseQuery = baseQuery.find(filterObj);
        }
        if (category && category?.length) {
            const categoryArray = category.split(',');
            baseQuery = baseQuery.or([{ category: { $in: categoryArray } }]);
        }

        const skip = (page - 1) * limit;
        const data = await baseQuery.skip(skip).limit(limit);

        if (data.length > 0) {
            const totalCount = data.length;
            const totalPages = Math.ceil(totalCount / limit);

            const result = {
                currentPage: page,
                totalPages: totalPages,
                totalData: totalCount,
                products: data,
            };
            return sendResponse(
                res,
                HTTP_STATUS.OK,
                'Successfully get the books',
                result
            );
        } else {
            return sendResponse(res, 200, 'No data found', []);
        }
    }
    catch(error) {
        return sendResponse(
            res,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            'Internal Server Error'
        );
    }

    async getBookById(req, res) {
        try {
            const { bookId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(bookId)) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'Invalid objectId provided'
                );
            }
            const result = await bookModel.findById(bookId);
            if (result) {
                return sendResponse(
                    res,
                    HTTP_STATUS.OK,
                    'Successfully get all the data',
                    result
                );
            }
            return sendResponse(res, HTTP_STATUS.BAD_REQUEST, 'No data found');
        } catch (error) {
            return sendResponse(
                res,
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                'Internal Server Error'
            );
        }
    }
}

module.exports = new BookController();

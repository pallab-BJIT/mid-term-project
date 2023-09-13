const HTTP_STATUS = require('../../constants/statusCode');
const bookModel = require('../../models/book');
const { sendResponse } = require('../../util/response');
const mongoose = require('mongoose');

class BookController {
    async getAllBooks(req, res) {
        try {
            const result = await bookModel.find({});
            if (result.length) {
                return sendResponse(
                    res,
                    HTTP_STATUS.OK,
                    'Successfully get all the data',
                    result
                );
            } else {
                return sendResponse(
                    res,
                    HTTP_STATUS.NO_CONTENT,
                    'No data found'
                );
            }
        } catch (error) {
            return sendResponse(
                res,
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                'Internal Server Error'
            );
        }
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
            console.log(result);
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
            console.log(error);
            return sendResponse(
                res,
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                'Internal Server Error'
            );
        }
    }
}

module.exports = new BookController();

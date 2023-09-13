const HTTP_STATUS = require('../../constants/statusCode');
const bookModel = require('../../models/book');
const { sendResponse } = require('../../util/response');

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
            const result = await bookModel.findById(bookId);
            console.log(result);
            if (result) {
                return sendResponse(
                    res,
                    HTTP_STATUS.OK,
                    'Successfully get all the data',
                    result
                );
            } else {
                console.log('not found');
                return sendResponse(
                    res,
                    HTTP_STATUS.NO_CONTENT,
                    'No data found',
                    []
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
}

module.exports = new BookController();

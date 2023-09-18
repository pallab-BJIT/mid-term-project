const { validationResult } = require('express-validator');
const HTTP_STATUS = require('../../constants/statusCode');
const bookModel = require('../../models/book');
const cartModel = require('../../models/cart');
const DiscountPrice = require('../../models/discountPrice');
const transactionModel = require('../../models/transaction');
const userModel = require('../../models/user');
const databaseLogger = require('../../util/dbLogger');
const { sendResponse } = require('../../util/response');
const calculateTotalPrice = require('../../util/totalPrice');
const mongoose = require('mongoose');
const { sendValidationError } = require('../../util/validationErrorHelper');
class TransactionController {
    async getAllTransaction(req, res) {
        try {
            databaseLogger(req.originalUrl);
            const result = await transactionModel
                .find({})
                .populate(
                    'books.book',
                    'title description price rating category'
                )
                .select('-__v');
            if (result.length) {
                return sendResponse(
                    res,
                    HTTP_STATUS.OK,
                    'Successfully received all transactions',
                    result
                );
            }
            return sendResponse(
                res,
                HTTP_STATUS.OK,
                'No transactions were found',
                []
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
    async createTransaction(req, res) {
        try {
            databaseLogger(req.originalUrl);
            const validation = validationResult(req).array();

            if (validation.length) {
                return sendValidationError(res, validation);
            }

            const { email } = req.user;
            const { cart, paymentMethod } = req.body;
            const userExists = await userModel.findOne({ email });
            const cartExistsForUser = await cartModel.findById(cart);
            if (!cartExistsForUser) {
                return sendResponse(
                    res,
                    HTTP_STATUS.UNPROCESSABLE_ENTITY,
                    'No cart exists for the user'
                );
            }
            if (cartExistsForUser.books.length === 0) {
                return sendResponse(
                    res,
                    HTTP_STATUS.UNPROCESSABLE_ENTITY,
                    'Please add books to cart first'
                );
            }
            const bookIds = cartExistsForUser.books.map(
                (ele) => new mongoose.Types.ObjectId(ele.book)
            );
            const discountPrice = await DiscountPrice.find({
                $and: [
                    { bookIds: { $in: bookIds } },
                    { startDate: { $lte: new Date() } },
                    { endDate: { $gte: new Date() } },
                    { counties: { $eq: userExists.address.country } },
                ],
            });

            const allBooks = await bookModel
                .find({
                    _id: { $in: bookIds },
                })
                .sort({ _id: 1 });

            bookIds.sort();

            let totalPrice = 0;
            cartExistsForUser.books.forEach((item, index) => {
                const bookId = item.book;
                const quantity = item.quantity;
                const book = allBooks[index];
                totalPrice += calculateTotalPrice(
                    book,
                    discountPrice,
                    bookId,
                    quantity
                );
            });
            if (userExists.balance < totalPrice) {
                return sendResponse(
                    res,
                    HTTP_STATUS.UNPROCESSABLE_ENTITY,
                    'Not enough balance.Please recharge and then place your order'
                );
            }

            const bookList = cartExistsForUser.books.map((element) => {
                return element.book;
            });
            const booksInCart = await bookModel.find({
                _id: {
                    $in: bookList,
                },
            });
            if (bookList.length !== booksInCart.length) {
                return sendResponse(
                    res,
                    HTTP_STATUS.UNPROCESSABLE_ENTITY,
                    'All products in cart do not exist'
                );
            }
            booksInCart.forEach((book) => {
                const bookFound = cartExistsForUser.books.findIndex(
                    (cartItem) => {
                        return String(cartItem.book) === String(book._id);
                    }
                );
                if (book.stock < cartExistsForUser.books[bookFound].quantity) {
                    return sendResponse(
                        res,
                        HTTP_STATUS.NOT_FOUND,
                        'Unable to check out at this time, product does not exist'
                    );
                }
                book.stock -= cartExistsForUser.books[bookFound].quantity;
            });

            const bulk = [];
            booksInCart.map((element) => {
                bulk.push({
                    updateOne: {
                        filter: { _id: element },
                        update: { $set: { stock: element.stock } },
                    },
                });
            });
            const stockSave = await bookModel.bulkWrite(bulk);
            const newTransaction = await transactionModel.create({
                books: cartExistsForUser.books,
                user: userExists._id,
                paymentMethod,
                totalPrice,
            });
            cartExistsForUser.books = [];
            const cartSave = await cartExistsForUser.save();
            userExists.balance -= totalPrice;
            const saveUserBalance = await userExists.save();
            if (cartSave && stockSave && saveUserBalance && newTransaction) {
                return sendResponse(
                    res,
                    HTTP_STATUS.CREATED,
                    'Order placed successfully',
                    newTransaction
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
}

module.exports = new TransactionController();

const { validationResult, check } = require('express-validator');
const databaseLogger = require('../../util/dbLogger');
const { sendValidationError } = require('../../util/validationErrorHelper');
const userModel = require('../../models/user');
const { sendResponse } = require('../../util/response');
const HTTP_STATUS = require('../../constants/statusCode');
const bookModel = require('../../models/book');
const cartModel = require('../../models/cart');
const DiscountPrice = require('../../models/discountPrice');
const mongoose = require('mongoose');
const calculateTotalPrice = require('../../util/totalPrice');
class CartController {
    async getCartByUser(req, res) {
        try {
            databaseLogger(req.originalUrl);
            const { email } = req.user;
            const userExists = await userModel.findOne({ email });

            if (!userExists) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'No user Found'
                );
            }

            const cartExistsForUser = await cartModel.findOne({
                user: userExists._id,
            });
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

            if (!cartExistsForUser) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'No data found',
                    []
                );
            }
            const data = {
                cartExistsForUser,
                totalPrice,
            };
            return sendResponse(
                res,
                HTTP_STATUS.OK,
                'Successfully get the data',
                data
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
    async addToCart(req, res) {
        try {
            databaseLogger(req.originalUrl);
            const validation = validationResult(req).array();

            if (validation.length) {
                return sendValidationError(res, validation);
            }
            const { email } = req.user;
            const { book, quantity } = req.body;
            if (!req.body) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'Can not process empty data'
                );
            }
            const userExists = await userModel.findOne({ email });
            const bookExists = await bookModel.findById(book);

            if (!userExists) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'No user Found'
                );
            }
            if (!bookExists) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'No book Found'
                );
            }
            const cartExistsForUser = await cartModel.findOne({
                user: userExists._id,
            });
            if (!cartExistsForUser) {
                if (quantity > bookExists.stock) {
                    return sendResponse(
                        res,
                        HTTP_STATUS.BAD_REQUEST,
                        'The given quantity exceed the book stock'
                    );
                }

                const saveToCart = await cartModel.create({
                    user: userExists._id,
                });
                saveToCart.books.push({ book, quantity });
                await saveToCart.save();

                if (!saveToCart) {
                    return sendResponse(
                        res,
                        HTTP_STATUS.BAD_REQUEST,
                        'Something went wrong'
                    );
                }

                return sendResponse(
                    res,
                    HTTP_STATUS.CREATED,
                    'Added to new cart',
                    saveToCart
                );
            } else {
                const bookExistsInCart = cartExistsForUser.books.findIndex(
                    (ele) => String(ele.book) === book
                );
                if (bookExistsInCart != -1) {
                    if (
                        cartExistsForUser.books[bookExistsInCart].quantity +
                            quantity >
                        bookExists.stock
                    ) {
                        return sendResponse(
                            res,
                            HTTP_STATUS.BAD_REQUEST,
                            'Not Enough stock'
                        );
                    }
                    cartExistsForUser.books[bookExistsInCart].quantity +=
                        quantity;
                    await cartExistsForUser.save();

                    return sendResponse(
                        res,
                        HTTP_STATUS.ACCEPTED,
                        'Quantity updated in the existing cart',
                        cartExistsForUser
                    );
                }
                if (bookExists.stock < quantity) {
                    return sendResponse(
                        res,
                        HTTP_STATUS.BAD_REQUEST,
                        'Not enough stock'
                    );
                }

                cartExistsForUser.books.push({ book, quantity });
                await cartExistsForUser.save();
                return sendResponse(
                    res,
                    HTTP_STATUS.ACCEPTED,
                    'Added to existing cart',
                    cartExistsForUser
                );
            }
        } catch (error) {
            databaseLogger(error.message);
            return sendResponse(
                res,
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                'Internal server error'
            );
        }
    }

    async updateCart(req, res) {
        try {
            databaseLogger(req.originalUrl);
            const validation = validationResult(req).array();

            if (validation.length) {
                return sendValidationError(res, validation);
            }
            const { email } = req.user;
            const { book, quantity } = req.body;
            const userExists = await userModel.findOne({ email });
            const bookExists = await bookModel.findById(book);

            if (!userExists) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'No user Found'
                );
            }
            if (!bookExists) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'No book Found'
                );
            }
            const cartExistsForUser = await cartModel.findOne({
                user: userExists._id,
            });

            if (!cartExistsForUser) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'No cart exist for this user'
                );
            }
            const bookExistsInCart = cartExistsForUser.books.findIndex(
                (ele) => {
                    console.log(String(ele.book), book);
                    return String(ele.book) === book;
                }
            );
            if (bookExistsInCart === -1) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'This book do not exist in the cart'
                );
            }
            if (quantity > cartExistsForUser.books[bookExistsInCart].quantity) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'The provided quantity exceed the quantity available in the cart'
                );
            }
            if (quantity < cartExistsForUser.books[bookExistsInCart].quantity) {
                cartExistsForUser.books[bookExistsInCart].quantity -= quantity;
                await cartExistsForUser.save();
                return sendResponse(
                    res,
                    HTTP_STATUS.ACCEPTED,
                    'Book quantity reduced from the cart',
                    cartExistsForUser
                );
            }
            if (
                quantity === cartExistsForUser.books[bookExistsInCart].quantity
            ) {
                cartExistsForUser.books.splice(bookExistsInCart);
                await cartExistsForUser.save();
                return sendResponse(
                    res,
                    HTTP_STATUS.ACCEPTED,
                    'Book successfully removed from the cart',
                    cartExistsForUser
                );
            }
        } catch (error) {
            databaseLogger(error.message);
            return sendResponse(
                res,
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                'Internal server error'
            );
        }
    }
}

module.exports = new CartController();

// total = bookExists.price * quantity * (1 - ele.discountPercentage / 100);

// availableForDiscount = true;

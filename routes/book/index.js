const express = require('express');
const router = express.Router();
const BookController = require('./../../controllers/book');
const validator = require('../../middlewares/validator');
const {
    tokenAuthorization,
    isAdmin,
} = require('../../middlewares/tokenValidator');
router
    .get('/all', [validator.getAllProductsFilter], BookController.getAllBooks)
    .get('/details/:bookId', BookController.getBookById)
    .post(
        '/create',
        [tokenAuthorization, isAdmin, validator.createBook],
        BookController.createBook
    )
    .patch(
        '/update/:bookId',
        [tokenAuthorization, isAdmin, validator.updateBook],
        BookController.updateBook
    )
    .delete(
        '/delete/:bookId',
        [tokenAuthorization, isAdmin, validator.deleteBook],
        BookController.deleteBook
    );

module.exports = router;

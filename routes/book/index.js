const express = require('express');
const router = express.Router();
const BookController = require('./../../controllers/book');
const validator = require('../../middlewares/validator');
router
    .get('/all', [validator.getAllProductsFilter], BookController.getAllBooks)
    .get('/details/:bookId', BookController.getBookById);

exports.router = router;

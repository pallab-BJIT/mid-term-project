const express = require('express');
const router = express.Router();
const BookController = require('./../../controllers/book');
router
    .get('/all', BookController.getAllBooks)
    .get('/details/:bookId', BookController.getBookById);

exports.router = router;

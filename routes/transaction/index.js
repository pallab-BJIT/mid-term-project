const express = require('express');
const router = express.Router();
const TransactionController = require('./../../controllers/transaction');
const validator = require('../../middlewares/validator');
const {
    tokenAuthorization,
    isUser,
} = require('../../middlewares/tokenValidator');

router
    .get(
        '/all',
        [tokenAuthorization, isUser],
        TransactionController.getAllTransaction
    )
    .post(
        '/create',
        [tokenAuthorization, isUser, validator.createTransaction],
        TransactionController.createTransaction
    );
// .patch(
//     '/update',
//     [tokenAuthorization, isUser, validator.updateCart],
//     CartController.updateCart
// );

module.exports = router;

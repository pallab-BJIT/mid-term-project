const express = require('express');
const router = express.Router();
const TransactionController = require('./../../controllers/transaction');
const validator = require('../../middlewares/validator');
const {
    tokenAuthorization,
    isUser,
} = require('../../middlewares/tokenValidator');

router
    // .get(
    //     '/cartByUser',
    //     [tokenAuthorization, isUser],
    //     CartController.getCartByUser
    // )
    .post(
        '/create',
        [tokenAuthorization, isUser],
        // CartController.addToCart
        TransactionController.createTransaction
    );
// .patch(
//     '/update',
//     [tokenAuthorization, isUser, validator.updateCart],
//     CartController.updateCart
// );

module.exports = router;

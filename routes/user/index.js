const express = require('express');
const router = express.Router();
const UserController = require('./../../controllers/user');
const validator = require('../../middlewares/validator');
const {
    tokenAuthorization,
    isAdmin,
} = require('../../middlewares/tokenValidator');

router
    .post(
        '/add-balance',
        [tokenAuthorization, validator.addBalance],
        UserController.addBalance
    )
    .get('/all', [tokenAuthorization, isAdmin], UserController.viewAllUserData);

exports.router = router;

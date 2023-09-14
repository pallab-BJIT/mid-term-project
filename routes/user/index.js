const express = require('express');
const router = express.Router();
const UserController = require('./../../controllers/user');
const validator = require('../../middlewares/validator');
const { tokenAuthorization } = require('../../middlewares/tokenValidator');
// const { checkUnsuccessfulLogin } = require('../../middlewares/loginAttempt');

router.post(
    '/add-balance',
    [tokenAuthorization, validator.addBalance],
    UserController.addBalance
);
// .delete('/logout', AuthController.logOut);

exports.router = router;

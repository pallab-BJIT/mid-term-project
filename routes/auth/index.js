const express = require('express');
const router = express.Router();
const AuthController = require('./../../controllers/auth');
const validator = require('../../middlewares/validator');
// const { checkUnsuccessfulLogin } = require('../../middlewares/loginAttempt');

router.post('/sign-up', validator.signUpUser, AuthController.signUp);
// .post(
//     '/login',
//     validator.loginUser,
//     checkUnsuccessfulLogin,
//     AuthController.login
// )
// .post('/refreshToken', AuthController.refreshToken)
// .delete('/logout', AuthController.logOut);

exports.router = router;

const { validationResult } = require('express-validator');
const { hashPasswordUsingBcrypt } = require('../../util/hashPassword');
const authModel = require('../../models/auth');
const userModel = require('../../models/user');
const { sendResponse } = require('../../util/response');
const HTTP_STATUS = require('../../constants/statusCode');

class AuthController {
    async signUp(req, res) {
        //
        try {
            const {
                email,
                password,
                confirmPassword,
                rank,
                name,
                phoneNumber,
                address,
            } = req.body;
            const validation = validationResult(req).array();
            if (validation.length) {
                const error = {};
                validation.forEach((ele) => {
                    const property = ele.path;
                    error[property] = ele.msg;
                });
                return sendResponse(
                    res,
                    HTTP_STATUS.UNPROCESSABLE_ENTITY,
                    'Unprocessable entity',
                    error
                );
            } else {
                const emailExists = await authModel.findOne({ email: email });
                const emailExistsAtUser = await userModel.findOne({
                    email: email,
                });
                if (!emailExists && !emailExistsAtUser) {
                    const newUser = await userModel.create({
                        email,
                        name,
                        phoneNumber,
                        address,
                    });
                    if (password != confirmPassword) {
                        return sendResponse(
                            res,
                            HTTP_STATUS.BAD_REQUEST,
                            'Password and confirm password should be same'
                        );
                    }
                    const hashedPassword =
                        await hashPasswordUsingBcrypt(password);
                    if (newUser && hashedPassword) {
                        const newRegistration = await authModel.create({
                            email,
                            password: hashedPassword,
                            rank,
                            user: newUser._id,
                        });

                        const savedRegistration = await authModel
                            .findById(newRegistration._id)
                            .select('-password')
                            .exec();
                        if (newRegistration && savedRegistration) {
                            return sendResponse(
                                res,
                                HTTP_STATUS.CREATED,
                                'Sign up successfully',
                                savedRegistration
                            );
                        } else {
                            return sendResponse(
                                res,
                                HTTP_STATUS.BAD_REQUEST,
                                'Something went wrong'
                            );
                        }
                    } else {
                        return sendResponse(
                            res,
                            HTTP_STATUS.BAD_REQUEST,
                            'Something went wrong'
                        );
                    }
                } else {
                    return sendResponse(
                        res,
                        HTTP_STATUS.BAD_REQUEST,
                        'The email is already in use'
                    );
                }
            }
        } catch (error) {
            console.log(error);
            return sendResponse(
                res,
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                'Internal server error'
            );
        }
    }
}

module.exports = new AuthController();

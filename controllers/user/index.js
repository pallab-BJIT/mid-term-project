const { validationResult } = require('express-validator');
const HTTP_STATUS = require('../../constants/statusCode');
const userModel = require('../../models/user');
const { sendResponse } = require('../../util/response');
const databaseLogger = require('../../util/dbLogger');
const authModel = require('../../models/auth');

class UserController {
    async addBalance(req, res) {
        try {
            databaseLogger(req.originalUrl);
            const { email, rank } = req.user;
            const { amount } = req.body;

            const validation = validationResult(req).array();
            if (validation.length) {
                const error = {};
                validation.forEach((validationError) => {
                    const property = validationError.path;
                    error[property] = validationError.msg;
                });
                return sendResponse(
                    res,
                    HTTP_STATUS.UNPROCESSABLE_ENTITY,
                    'Unprocessable Entity',
                    error
                );
            }
            if (rank === 1) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'You are not allowed to access this'
                );
            }
            const user = await userModel.findOne({ email });
            if (!user) {
                return sendResponse(
                    res,
                    HTTP_STATUS.NOT_FOUND,
                    'No user found'
                );
            }

            if (user.balance >= 100) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'You can only add amount when your balance less than 100'
                );
            }
            user.balance = 0;
            await user.save();
            user.balance += amount;
            const addedBalance = await user.save();
            if (addedBalance) {
                return sendResponse(
                    res,
                    HTTP_STATUS.ACCEPTED,
                    'Balance added successfully',
                    user
                );
            }
            return sendResponse(
                res,
                HTTP_STATUS.BAD_REQUEST,
                'Something went wrong.Please try again later.'
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

    async viewAllUserData(req, res) {
        try {
            databaseLogger(req.originalUrl);
            const users = await userModel.find({});
            if (!users.length) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'No data found',
                    []
                );
            }

            return sendResponse(
                res,
                HTTP_STATUS.OK,
                'Successfully get all the data',
                users
            );
        } catch (error) {
            databaseLogger(error.message);
            return sendResponse(
                res,
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                'Internal server error'
            );
        }
    }

    async deleteUser(req, res) {
        try {
            databaseLogger(req.originalUrl);
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
                    'Unprocessable Entity',
                    error
                );
            }
            const { userId } = req.params;
            const result = await authModel.findByIdAndDelete(userId);
            if (!result) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'No user associated with this id'
                );
            }
            const user = await userModel.findByIdAndDelete(result.user);
            console.log({ user });
            if (!user) {
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'No user associated with this id'
                );
            }
            return sendResponse(
                res,
                HTTP_STATUS.OK,
                'Deleted user successfully',
                result
            );
        } catch (error) {
            databaseLogger(error.message);
            return sendResponse(res, 500, 'Internal server error');
        }
    }

    async updateUser(req, res) {
        try {
            databaseLogger(req.originalUrl);
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
                    'Unprocessable Entity',
                    error
                );
            }
            const { name, rank, isVerified } = req.body;
        } catch (error) {
            databaseLogger(error.message);
            return sendResponse(res, 500, 'Internal server error');
        }
    }
}

module.exports = new UserController();

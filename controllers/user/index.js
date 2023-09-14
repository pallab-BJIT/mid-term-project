const { validationResult } = require('express-validator');
const HTTP_STATUS = require('../../constants/statusCode');
const userModel = require('../../models/user');
const { sendResponse } = require('../../util/response');
const databaseLogger = require('../../util/dbLogger');

class UserController {
    async addBalance(req, res) {
        try {
            databaseLogger(req.url);
            const { email } = req.user;
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
            const user = await userModel.findOne({ email });

            if (!user) {
                return sendResponse(
                    res,
                    HTTP_STATUS.NOT_FOUND,
                    'No user found'
                );
            }

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
}

module.exports = new UserController();

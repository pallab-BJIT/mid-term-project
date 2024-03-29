const { validationResult } = require('express-validator');
const HTTP_STATUS = require('../../constants/statusCode');
const userModel = require('../../models/user');
const { sendResponse } = require('../../util/response');
const databaseLogger = require('../../util/dbLogger');
const authModel = require('../../models/auth');
const { sendValidationError } = require('../../util/validationErrorHelper');

class UserController {
    async addBalance(req, res) {
        try {
            databaseLogger(req.originalUrl);
            const { email, rank } = req.user;
            const { amount } = req.body;

            const validation = validationResult(req).array();
            if (validation.length) {
                return sendValidationError(res, validation);
            }

            if (rank === 1) {
                return sendResponse(
                    res,
                    HTTP_STATUS.UNAUTHORIZED,
                    'You are not allowed to access this'
                );
            }
            const allowedProperties = ['amount'];

            for (const key in req.body) {
                if (!allowedProperties.includes(key)) {
                    return sendResponse(
                        res,
                        HTTP_STATUS.UNPROCESSABLE_ENTITY,
                        'Invalid property provided for user update: '
                    );
                }
            }

            const user = await userModel.findOne({ email });
            if (!user) {
                return sendResponse(
                    res,
                    HTTP_STATUS.NOT_FOUND,
                    'No user found'
                );
            }

            if (!user.balance) {
                user.balance = 0;
            }
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
                    HTTP_STATUS.NOT_FOUND,
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
                return sendValidationError(res, validation);
            }

            const { userId } = req.params;
            const findUserFromAuth = await authModel.findById(userId);
            if (!findUserFromAuth) {
                return sendResponse(
                    res,
                    HTTP_STATUS.UNPROCESSABLE_ENTITY,
                    'No user associated with this id'
                );
            }
            if (findUserFromAuth.rank === 1) {
                return sendResponse(
                    res,
                    HTTP_STATUS.UNAUTHORIZED,
                    'You can not perform this action'
                );
            }
            const result = await authModel.findById(userId);
            if (!result) {
                return sendResponse(
                    res,
                    HTTP_STATUS.UNPROCESSABLE_ENTITY,
                    'No user associated with this id'
                );
            }

            const user = await userModel.findById(result.user);
            if (!user) {
                return sendResponse(
                    res,
                    HTTP_STATUS.UNPROCESSABLE_ENTITY,
                    'No user associated with this id'
                );
            }

            result.isUserRestricted = true;
            await result.save();
            return sendResponse(
                res,
                HTTP_STATUS.OK,
                'User restricted successfully',
                result
            );
        } catch (error) {
            console.log(error);
            databaseLogger(error.message);
            return sendResponse(res, 500, 'Internal server error');
        }
    }

    async updateUser(req, res) {
        try {
            databaseLogger(req.originalUrl);
            const validation = validationResult(req).array();
            if (validation.length) {
                return sendValidationError(res, validation);
            }

            const { name, rank, isVerified } = req.body;
            const { userId } = req.params;
            const allowedProperties = ['name', 'rank', 'isVerified'];

            for (const key in req.body) {
                if (!allowedProperties.includes(key)) {
                    return sendResponse(
                        res,
                        HTTP_STATUS.UNPROCESSABLE_ENTITY,
                        'Invalid property provided for user update: '
                    );
                }
            }

            const result = await authModel.findById(userId);
            if (!result) {
                return sendResponse(
                    res,
                    HTTP_STATUS.UNPROCESSABLE_ENTITY,
                    'No user associated with this id'
                );
            }
            const user = await userModel.findById(result.user);
            if (name) {
                user.name = name;
            }
            if (rank) {
                result.rank = rank;
            }
            if (isVerified === true || isVerified === false) {
                result.isVerified = isVerified;
                console.log(result);
            }
            const updatedUser = await user.save();
            const updatedResult = await result.save();

            if (updatedResult || updatedUser) {
                const newResult = await authModel
                    .findById(userId)
                    .select('-password')
                    .populate('user', '-email -phoneNumber');
                return sendResponse(
                    res,
                    HTTP_STATUS.OK,
                    'Updated user successfully',
                    newResult
                );
            }
            return sendResponse(
                res,
                HTTP_STATUS.BAD_REQUEST,
                'Something went wrong.'
            );
        } catch (error) {
            console.log(error);
            databaseLogger(error.message);
            return sendResponse(res, 500, 'Internal server error');
        }
    }
}

module.exports = new UserController();

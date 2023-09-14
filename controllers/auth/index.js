const { validationResult } = require('express-validator');
const {
    hashPasswordUsingBcrypt,
    comparePasswords,
} = require('../../util/hashPassword');
const authModel = require('../../models/auth');
const userModel = require('../../models/user');
const { sendResponse } = require('../../util/response');
const HTTP_STATUS = require('../../constants/statusCode');
const generateAccessToken = require('../../util/accessTokenGenerator');
const generateRefreshToken = require('../../util/refreshTokenGenerator');
const jwt = require('jsonwebtoken');
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

    async login(req, res) {
        try {
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
            } else {
                const { email, password } = req.body;
                const emailExists = await authModel
                    .findOne({ email: email })
                    .populate('user');
                if (!emailExists) {
                    return sendResponse(
                        res,
                        HTTP_STATUS.BAD_REQUEST,
                        'You are not registered'
                    );
                } else {
                    const passwordExists = await comparePasswords(
                        password,
                        emailExists?.password
                    );

                    if (!passwordExists) {
                        return sendResponse(
                            res,
                            HTTP_STATUS.BAD_REQUEST,
                            'Wrong credentials'
                        );
                    } else {
                        const data = {
                            _id: emailExists?._id,
                            email: emailExists?.email,
                            rank: emailExists?.rank,
                            name: emailExists?.user?.name,
                            address: emailExists?.user?.address,
                            phoneNumber: emailExists?.user?.phoneNumber,
                        };
                        const jwtToken = generateAccessToken(data);
                        const refreshToken = generateRefreshToken(data);
                        data.accessToken = jwtToken;
                        data.refreshToken = refreshToken;
                        emailExists.sessionActive = true;
                        await emailExists.save();

                        return sendResponse(
                            res,
                            HTTP_STATUS.OK,
                            'Sign in successful',
                            data
                        );
                    }
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

    async refreshToken(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token || token === undefined) {
                return res.status(401).json(failure('Token Cannot be Null'));
            }
            const secretKey = process.env.REFRESH_TOKEN_SECRET;

            const decoded = await jwt.verify(token, secretKey);
            delete decoded.iat;
            delete decoded.exp;
            if (decoded) {
                const accessToken = generateAccessToken(decoded);
                if (accessToken) {
                    return sendResponse(
                        res,
                        HTTP_STATUS.OK,
                        'Access token generated successfully',
                        accessToken
                    );
                }
                return sendResponse(
                    res,
                    HTTP_STATUS.BAD_REQUEST,
                    'Something went wrong'
                );
            }
        } catch (error) {
            console.log(error);
            if (error instanceof jwt.TokenExpiredError) {
                return sendResponse(
                    res,
                    HTTP_STATUS.UNAUTHORIZED,
                    'Please login again'
                );
            }
            if (error instanceof jwt.JsonWebTokenError) {
                return sendResponse(
                    res,
                    HTTP_STATUS.UNAUTHORIZED,
                    'Unauthorized access'
                );
            }
            return sendResponse(
                res,
                HTTP_STATUS.UNAUTHORIZED,
                'Unauthorized access'
            );
        }
    }
}

module.exports = new AuthController();

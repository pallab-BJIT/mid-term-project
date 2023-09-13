const { query, body } = require('express-validator');
const { PHONE_REGEX } = require('../constants/regex');

const validator = {
    getAllProductsFilter: [
        query('offset')
            .optional()
            .custom((value, { req, res }) => {
                const val = parseInt(value);
                if (isNaN(val)) {
                    throw new Error('Offset must be a number');
                }
                if (value >= 1) {
                    if (!req.query.limit) {
                        throw new Error('Limit is not specified');
                    } else {
                        return true;
                    }
                } else {
                    throw new Error('Offset cannot be less than 1');
                }
            }),
        query('limit')
            .optional()
            .custom((value, { req, res }) => {
                const val = parseInt(value);
                if (isNaN(val)) {
                    throw new Error('limit must be a number');
                }
                if (value >= 1) {
                    if (!req.query.offset) {
                        throw new Error('Offset is not specified');
                    } else {
                        return true;
                    }
                } else {
                    throw new Error('Limit cannot be less than 1');
                }
            }),
        query('search')
            .optional()
            .not()
            .equals('')
            .withMessage('Search cannot be empty'),
        query('sortBy')
            .optional()
            .not()
            .equals('')
            .withMessage('SortBy cannot be empty')
            .bail()
            .custom((value, { req, res }) => {
                if (
                    value === 'price' ||
                    value === 'stock' ||
                    value === 'rating'
                ) {
                    if (!req.query.sortOrder) {
                        throw new Error('Sort order is not specified');
                    } else {
                        return true;
                    }
                } else {
                    throw new Error('Invalid property provided for sortBy');
                }
            }),
        query('sortOrder')
            .optional()
            .not()
            .equals('')
            .withMessage('sortOrder cannot be empty')
            .bail()
            .custom((value, { req }) => {
                if (value === 'asc' || value === 'desc') {
                    if (!req.query.sortBy) {
                        throw new Error('Sort By is not specified');
                    } else {
                        return true;
                    }
                } else {
                    throw new Error('Invalid property provided for sortOrder');
                }
            }),
        query('filter')
            .optional()
            .not()
            .equals('')
            .withMessage('filter cannot be empty')
            .bail()
            .custom((value, { req, res }) => {
                if (
                    value === 'stock' ||
                    value === 'price' ||
                    value === 'rating' ||
                    value === 'discountPercentage'
                ) {
                    if (!req.query.filterOrder) {
                        throw new Error('Filter  order is not specified');
                    }
                    if (!req.query.filterValue) {
                        throw new Error('Filter  value is not specified');
                    } else {
                        return true;
                    }
                } else {
                    throw new Error('Invalid property provided for filter');
                }
            }),
        query('filterOrder')
            .optional()
            .not()
            .equals('')
            .withMessage('filterOrder cannot be empty')
            .bail()
            .custom((value, { req }) => {
                if (value === 'high' || value === 'low') {
                    if (!req.query.filter) {
                        throw new Error('Filter is not specified');
                    }
                    if (!req.query.filterValue) {
                        throw new Error('Filter  value is not specified');
                    } else {
                        return true;
                    }
                } else {
                    throw new Error(
                        'Invalid property provided for filterOrder'
                    );
                }
            }),
        query('filterValue')
            .optional()
            .not()
            .equals('')
            .withMessage('filterValue cannot be empty')
            .bail()
            .custom((value, { req }) => {
                value = parseInt(value);
                if (!isNaN(value)) {
                    if (!req.query.filter) {
                        throw new Error('Filter is not specified');
                    }
                    if (!req.query.filterOrder) {
                        throw new Error('Filter order value is not specified');
                    } else {
                        return true;
                    }
                } else {
                    throw new Error('Filter value must be a number');
                }
            }),
        query('category')
            .optional()
            .custom((value) => {
                if (value.length) {
                    const category = value.split(',');
                    const validCategory = category.every(function (item) {
                        return typeof item === 'string';
                    });
                    if (!validCategory) {
                        throw new Error('All the categories must be strings');
                    } else {
                        return true;
                    }
                } else {
                    throw new Error('Category cannot be empty');
                }
            }),
    ],

    signUpUser: [
        body('name')
            .exists()
            .not()
            .equals('')
            .withMessage('Name is required')
            .bail()
            .isString()
            .withMessage('Name Must be of type string'),
        body('email')
            .exists()
            .not()
            .equals('')
            .withMessage('Email is required')
            .bail()
            .isString()
            .withMessage('Email Must be of type string')
            .bail()
            .isEmail()
            .withMessage('Invalid email address'),
        body('password')
            .exists()
            .not()
            .equals('')
            .withMessage('Password is required')
            .bail()
            .custom((value, { req }) => {
                let { name, email } = req.body;
                name = name.replace(/\s+/g, '');
                email = email.split('@')[0];
                const nameRegex = new RegExp(name, 'i');
                const emailRegex = new RegExp(email, 'i');
                if (nameRegex.test(value) || emailRegex.test(value)) {
                    throw new Error(
                        'Password cannot contain your username or email'
                    );
                } else {
                    return true;
                }
            })
            .bail()
            .isString()
            .withMessage('Password Must be of type string')
            .bail()
            .isStrongPassword({
                minLength: 8,
                minLowerCase: 1,
                minUpperCase: 1,
                minSymbols: 1,
                minNumbers: 1,
            })
            .withMessage(
                'Password must be at least 8 characters with a lowercase ,a uppercase,a number and a special character'
            ),
        body('confirmPassword')
            .exists()
            .not()
            .equals('')
            .withMessage('Password is required')
            .bail()
            .custom((value, { req }) => {
                let { name, email } = req.body;
                name = name.replace(/\s+/g, '');
                email = email.split('@')[0];
                const nameRegex = new RegExp(name, 'i');
                const emailRegex = new RegExp(email, 'i');
                if (nameRegex.test(value) || emailRegex.test(value)) {
                    throw new Error(
                        'Password cannot contain your username or email'
                    );
                } else {
                    return true;
                }
            })
            .bail()
            .isString()
            .withMessage('Password Must be of type string')
            .bail()
            .isStrongPassword({
                minLength: 8,
                minLowerCase: 1,
                minUpperCase: 1,
                minSymbols: 1,
                minNumbers: 1,
            })
            .withMessage(
                'Password must be at least 8 characters with a lowercase ,a uppercase,a number and a special character'
            ),

        body('phoneNumber')
            .exists()
            .not()
            .equals('')
            .withMessage('PhoneNumber is required')
            .bail()
            .isNumeric()
            .withMessage('PhoneNumber must be a number')
            .bail()
            .custom((data) => {
                if (PHONE_REGEX.test(data)) {
                    return true;
                } else {
                    throw new Error('This is not a valid phone number');
                }
            }),
        body('rank')
            .optional()
            .custom((data) => {
                if (data > 0 && data < 10 && typeof data === 'number') {
                    return true;
                }
                throw new Error('Rank must be between 1 and 10');
            })
            .bail()
            .isNumeric()
            .withMessage('Rank must be a number'),
        body('address.country')
            .exists()
            .not()
            .equals('')
            .withMessage('Country is required')
            .bail()
            .isString()
            .withMessage('Country only be string'),
        body('address.city')
            .exists()
            .not()
            .equals('')
            .withMessage('City is required')
            .bail()
            .isString()
            .withMessage('City only be string'),
        body('address.area')
            .exists()
            .not()
            .equals('')
            .withMessage('Area is required')
            .bail()
            .isString()
            .withMessage('Area only be string'),
        body('address.street')
            .exists()
            .not()
            .equals('')
            .withMessage('Street is required')
            .bail()
            .isString()
            .withMessage('Street only be string'),
    ],
};

module.exports = validator;

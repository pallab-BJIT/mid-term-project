const { query, body, param } = require('express-validator');
const { PHONE_REGEX } = require('../constants/regex');
const mongoose = require('mongoose');
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

    createBook: [
        body('title').notEmpty().withMessage('Title is required.'),
        body('description').notEmpty().withMessage('Description is required.'),
        body('price')
            .isFloat({ min: 0, max: 10000 })
            .withMessage('Price must be a valid number between 0 and 100.'),
        body('rating')
            .isFloat({ min: 0, max: 5 })
            .withMessage('Rating is required and must be between 0 and 5.'),
        body('stock')
            .isFloat({ min: 0, max: 300 })
            .withMessage('Stock must be a valid number between 0 and 300.'),
        body('author').notEmpty().withMessage('Author is required.'),
        body('category').notEmpty().withMessage('Category is required.'),
        body('publishedAt')
            .not()
            .equals('')
            .withMessage('Published At cannot be empty')
            .bail()
            .isDate()
            .withMessage('Published at must be of type Date'),
        body('isbn')
            .not()
            .equals()
            .withMessage('ISBN number cannot be empty')
            .bail()
            .isISBN()
            .withMessage('Invalid ISBN number'),
    ],
    updateBook: [
        param('bookId')
            .exists()
            .withMessage('Please provide book id')
            .bail()
            .custom((value) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error('Invalid object Id provided');
                } else {
                    return true;
                }
            }),
        body('title')
            .optional()
            .optional()
            .isString()
            .withMessage('Title must be of type string')
            .bail()
            .custom((value) => typeof value === 'string' && value.trim() !== '')
            .withMessage('Title is required.'),
        body('description')
            .optional()
            .optional()
            .isString()
            .withMessage('Description must be of type string')
            .bail()
            .custom((value) => typeof value === 'string' && value.trim() !== '')
            .withMessage('Description is required.'),
        body('price')
            .optional()
            .isFloat({ min: 10, max: 10000 })
            .withMessage('Price must be a valid number between 0 and 100.'),
        body('rating')
            .optional()
            .isFloat({ min: 1, max: 5 })
            .withMessage('Rating must be a valid number between 1 and 5.'),
        body('stock')
            .optional()
            .isFloat({ min: 10, max: 500 })
            .withMessage('Stock must be a valid number between 10 and 500.'),
        body('author')
            .optional()
            .optional()
            .isString()
            .withMessage('Author must be of type string')
            .bail()
            .custom((value) => typeof value === 'string' && value.trim() !== '')
            .withMessage('Author is required.'),
        body('category')
            .optional()
            .optional()
            .isString()
            .withMessage('Category must be of type string')
            .bail()
            .custom((value) => typeof value === 'string' && value.trim() !== '')
            .withMessage('Category is required.'),
        body('publishedAt')
            .optional()
            .isDate()
            .withMessage('Invalid published At date provided')
            .custom((value) => value.trim() !== '')
            .withMessage('publishedAt is required.'),
        body('isbn')
            .optional()
            .isISBN()
            .withMessage('Invalid ISBN provided')
            .bail()
            .custom((value) => value.trim() !== '')
            .withMessage('ISBN is required.'),
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

    loginUser: [
        body('email')
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
            .not()
            .equals('')
            .withMessage('Password is required')
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
    ],

    addBalance: [
        body('amount')
            .exists()
            .withMessage('Amount is required')
            .custom((value) => {
                if (value <= 0 || isNaN(value) || value > 30000) {
                    throw new Error(
                        'Amount must be a positive value less than 30000'
                    );
                } else {
                    return true;
                }
            }),
    ],

    deleteBook: [
        param('bookId')
            .exists()
            .withMessage('Please provide book id')
            .custom((value) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error('Invalid object Id provided');
                } else {
                    return true;
                }
            }),
    ],

    deleteUser: [
        param('userId')
            .exists()
            .withMessage('Please provide user id')
            .custom((value) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error('Invalid object Id provided');
                } else {
                    return true;
                }
            }),
    ],

    updateUser: [
        body('name')
            .optional()
            .isString()
            .withMessage('Name only be of type string')
            .bail()
            .custom((value) => {
                if (value.trim() === '') {
                    throw new Error('Name is required');
                } else {
                    return true;
                }
            }),
        body('rank')
            .optional()
            .custom((value) => {
                console.log(typeof value);
                if (value > 2) {
                    throw new Error('Invalid rank provided');
                } else if (!value) {
                    throw new Error('Rank can not be empty');
                } else if (typeof value != 'number') {
                    throw new Error('Rank must be of type number');
                } else {
                    return true;
                }
            }),
        body('isVerified')
            .optional()
            .isBoolean()
            .withMessage('Invalid value provided'),
    ],

    addBookReview: [
        body('book')
            .exists()
            .not()
            .equals('')
            .withMessage('book id cannot be empty')
            .bail()
            .custom((value) => {
                if (mongoose.Types.ObjectId.isValid(value)) {
                    return true;
                } else {
                    throw new Error('Invalid book id');
                }
            }),
        body('message')
            .optional()
            .not()
            .equals('')
            .withMessage('Message  cannot be empty')
            .bail(),
        body('rating')
            .exists()
            .withMessage('Rating can not be null')
            .bail()
            .custom((value) => {
                if (!isNaN(value)) {
                    if (value >= 1 && value <= 5) return true;
                    throw new Error('Rating must be between 1 and 5');
                } else {
                    throw new Error('Rating only accepts numeric values');
                }
            }),
    ],

    updateBookReview: [
        param('bookId')
            .optional()
            .not()
            .equals('')
            .withMessage('book id cannot be empty')
            .bail()
            .custom((value) => {
                if (mongoose.Types.ObjectId.isValid(value)) {
                    return true;
                } else {
                    throw new Error('Invalid book id');
                }
            }),
        body('rating')
            .exists()
            .withMessage('Rating can not be null')
            .bail()
            .custom((value) => {
                if (!isNaN(value)) {
                    if (value >= 1 && value <= 5) return true;
                    throw new Error('Rating must be between 1 and 5');
                } else {
                    throw new Error('Rating only accepts numeric values');
                }
            }),
    ],

    deleteBookReview: [
        param('bookId')
            .optional()
            .not()
            .equals('')
            .withMessage('book id cannot be empty')
            .bail()
            .custom((value) => {
                if (mongoose.Types.ObjectId.isValid(value)) {
                    return true;
                } else {
                    throw new Error('Invalid book id');
                }
            }),
    ],
};

module.exports = validator;

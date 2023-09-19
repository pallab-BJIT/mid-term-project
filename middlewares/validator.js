const { query, body, param } = require('express-validator');
const { PHONE_REGEX } = require('../constants/regex');
const mongoose = require('mongoose');
const validator = {
    createBook: [
        body('title')
            .exists()
            .notEmpty()
            .withMessage('Title is required.')
            .bail()
            .isString()
            .isLength({ min: 3, max: 50 })
            .withMessage('Title length must be between 3 to 50'),
        body('description')
            .exists()
            .notEmpty()
            .withMessage('Description is required.')
            .bail()
            .isString()
            .isLength({ min: 15, max: 200 })
            .withMessage('Title length must be between 15 to 200'),
        body('price')
            .exists()
            .isFloat({ min: 0, max: 10000 })
            .withMessage('Price must be a valid number between 0 and 100.'),
        body('rating')
            .exists()
            .isFloat({ min: 1, max: 5 })
            .withMessage('Rating is required and must be between 1 and 5.'),
        body('stock')
            .exists()
            .isFloat({ min: 10, max: 500 })
            .withMessage('Stock must be a valid number between 10 and 500.'),
        body('author')
            .exists()
            .notEmpty()
            .withMessage('Author is required.')
            .bail()
            .isString()
            .withMessage('Author must be a string'),
        body('category')
            .exists()
            .notEmpty()
            .withMessage('Category is required.')
            .bail()
            .isString()
            .withMessage('Category must be a string')
            .bail()
            .isLength({ min: 3, max: 50 })
            .withMessage('Category length must be between 3 to 50'),
        body('publishedAt')
            .not()
            .equals('')
            .withMessage('Published At cannot be empty')
            .bail()
            .isDate()
            .withMessage('Published at must be of type Date'),
        body('isbn')
            .exists()
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
            .isString()
            .withMessage('Title must be of type string')
            .bail()
            .isLength({ min: 3, max: 50 })
            .withMessage('Title length must be between 3 to 50')
            .bail()
            .custom((value) => typeof value === 'string' && value.trim() !== '')
            .withMessage('Title is required.'),
        body('description')
            .optional()
            .isString()
            .withMessage('Description must be of type string')
            .bail()
            .isLength({ min: 15, max: 200 })
            .withMessage('Title length must be between 15 to 200')
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
            .withMessage('Category is required.')
            .bail()
            .isLength({ min: 3, max: 50 })
            .withMessage('Category length must be between 3 to 50'),
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
            .custom((value) => {
                if (typeof value === 'boolean') {
                    return true;
                } else {
                    throw new Error('Invalid value provided');
                }
            }),
    ],

    addBookReview: [
        param('book')
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

    addDiscount: [
        body('discountPercentage')
            .exists()
            .withMessage('Discount Percentage is required')
            .bail()
            .isNumeric()
            .withMessage('Discount Percentage can only be of type number')
            .bail()
            .custom((value) => {
                if (value < 5) {
                    throw new Error(
                        'Discount Percentage can not be less than 5'
                    );
                }
                if (value > 40) {
                    throw new Error(
                        'Discount Percentage can not be greater than 40'
                    );
                } else {
                    return true;
                }
            }),
        body('bookId')
            .exists()
            .withMessage('Book ID is required')
            .bail()
            .custom((value) => {
                const allBookIdAvailable = value.every(
                    (ele) => ele.trim() != ''
                );
                const allBookIdType = value.every((ele) =>
                    mongoose.Types.ObjectId.isValid(ele)
                );
                if (!value.length) {
                    throw new Error('Book ID is required');
                }
                if (!allBookIdAvailable) {
                    throw new Error('Book ID is required');
                }
                if (allBookIdType) {
                    return true;
                } else {
                    throw new Error('Invalid Book id');
                }
            }),
        body('startDate')
            .exists()
            .withMessage('Start Date is required')
            .bail()
            .isDate()
            .withMessage('Start date can only be of type of date')
            .custom((value) => {
                if (value.trim() === '') {
                    throw new Error('Start date is required');
                } else {
                    return true;
                }
            }),
        body('endDate')
            .exists()
            .withMessage('End Date is required')
            .bail()
            .isDate()
            .withMessage('End date can only be of type of date')
            .custom((value) => {
                if (value.trim() === '') {
                    throw new Error('End date is required');
                } else {
                    return true;
                }
            }),
        body('country')
            .exists()
            .withMessage('County is required')
            .bail()
            .custom((value) => {
                const allCountryType = value.every(
                    (ele) => typeof ele === 'string'
                );
                let allCountyAvailable;
                if (allCountryType) {
                    allCountyAvailable = value.every(
                        (ele) => ele?.trim() != ''
                    );
                }
                if (!value.length) {
                    throw new Error('Country is required');
                }
                if (!allCountyAvailable) {
                    throw new Error('Country is required');
                } else if (!allCountryType) {
                    throw new Error('Country type must be string');
                } else {
                    return true;
                }
            }),
    ],

    updateDiscount: [
        param('discountId')
            .exists()
            .withMessage('Discount id is required')
            .custom((value) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error('Invalid discount id provided');
                } else {
                    return true;
                }
            }),
        body('discountPercentage')
            .optional()
            .isNumeric()
            .withMessage('Discount Percentage can only be of type number')
            .bail()
            .custom((value) => {
                if (value < 5) {
                    throw new Error(
                        'Discount Percentage can not be less than 5'
                    );
                }
                if (value > 40) {
                    throw new Error(
                        'Discount Percentage can not be greater than 40'
                    );
                } else {
                    return true;
                }
            }),
        body('bookId')
            .optional()
            .custom((value) => {
                const allBookIdAvailable = value.every(
                    (ele) => ele.trim() != ''
                );
                const allBookIdType = value.every((ele) =>
                    mongoose.Types.ObjectId.isValid(ele)
                );
                if (!value.length) {
                    throw new Error('Book ID is required');
                }
                if (!allBookIdAvailable) {
                    throw new Error('Book ID is required');
                }
                if (allBookIdType) {
                    return true;
                } else {
                    throw new Error('Invalid Book id');
                }
            }),
        body('startDate')
            .optional()
            .isDate()
            .withMessage('Start date can only be of type of date')
            .custom((value) => {
                if (value.trim() === '') {
                    throw new Error('Start date is required');
                } else {
                    return true;
                }
            }),
        body('endDate')
            .optional()
            .isDate()
            .withMessage('End date can only be of type of date')
            .custom((value) => {
                if (value.trim() === '') {
                    throw new Error('End date is required');
                } else {
                    return true;
                }
            }),
        body('country')
            .optional()
            .custom((value) => {
                const allCountryType = value.every(
                    (ele) => typeof ele === 'string'
                );
                let allCountyAvailable;
                if (allCountryType) {
                    allCountyAvailable = value.every(
                        (ele) => ele?.trim() != ''
                    );
                }
                if (!value.length) {
                    throw new Error('Country is required');
                }
                if (!allCountyAvailable) {
                    throw new Error('Country is required');
                } else if (!allCountryType) {
                    throw new Error('Country type must be string');
                } else {
                    return true;
                }
            }),
    ],

    deleteDiscount: [
        param('discountId')
            .exists()
            .withMessage('Discount id is required')
            .custom((value) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error('Invalid discount id provided');
                } else {
                    return true;
                }
            }),
        body('bookId')
            .optional()
            .custom((value) => {
                const allBookIdAvailable = value.every(
                    (ele) => ele.trim() != ''
                );
                const allBookIdType = value.every((ele) =>
                    mongoose.Types.ObjectId.isValid(ele)
                );
                if (!value.length) {
                    throw new Error('Book ID is required');
                }
                if (!allBookIdAvailable) {
                    throw new Error('Book ID is required');
                }
                if (allBookIdType) {
                    return true;
                } else {
                    throw new Error('Invalid Book id');
                }
            }),
    ],

    addToCart: [
        body('book')
            .exists()
            .withMessage('Book id is required')
            .bail()
            .not()
            .equals('')
            .withMessage('Book id is required')
            .bail()
            .custom((value) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error('Invalid book id provided');
                } else {
                    return true;
                }
            }),
        body('quantity')
            .exists()
            .withMessage('Quantity is required')
            .bail()
            .custom((value) => {
                if (value <= 0) {
                    throw new Error('Quantity can not be less than 0');
                } else if (value > 10000000) {
                    throw new Error(
                        'Quantity can not be greater than 10000000'
                    );
                } else {
                    return true;
                }
            }),
    ],

    updateCart: [
        body('book')
            .exists()
            .withMessage('Book id is required')
            .bail()
            .not()
            .equals('')
            .withMessage('Book id is required')
            .bail()
            .custom((value) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error('Invalid book id provided');
                } else {
                    return true;
                }
            }),
        body('quantity')
            .exists()
            .withMessage('Quantity is required')
            .bail()
            .custom((value) => {
                if (value <= 0) {
                    throw new Error('Quantity can not be less than 0');
                } else if (value > 10000000) {
                    throw new Error(
                        'Quantity can not be greater than 10000000'
                    );
                } else {
                    return true;
                }
            }),
    ],

    createTransaction: [
        body('cart')
            .exists()
            .withMessage('Book id is required')
            .bail()
            .not()
            .equals('')
            .withMessage('Book id is required')
            .bail()
            .custom((value) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error('Invalid book id provided');
                } else {
                    return true;
                }
            }),
        body('paymentMethod')
            .exists()
            .withMessage('Payment method is required')
            .bail()
            .not()
            .equals('')
            .withMessage('Payment method is required')
            .custom((value) => {
                const allowedPaymentMethods = ['online', 'cash', 'card'];
                if (!allowedPaymentMethods.includes(value)) {
                    throw new Error('Invalid payment method provided');
                } else if (value.length > 20) {
                    throw new Error(
                        'Payment method length can not be greater than 20'
                    );
                } else {
                    return true;
                }
            }),
    ],
};

module.exports = validator;

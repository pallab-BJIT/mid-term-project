const { query, body } = require('express-validator');

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
};

module.exports = validator;

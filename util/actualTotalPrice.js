const bookModel = require('../models/book');
const DiscountPrice = require('../models/discountPrice');

function calculateTotalPriceWithOutDiscount(book, quantity) {
    return book.price * quantity;
}
module.exports = calculateTotalPriceWithOutDiscount;

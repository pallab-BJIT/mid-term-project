const bookModel = require('../models/book');
const DiscountPrice = require('../models/discountPrice');

function calculateTotalPrice(book, discounts, bookId, quantity) {
    const discount = discounts.find((d) => d.bookIds.includes(bookId));
    if (discount) {
        const discountAmount = (book.price * discount.discountPercentage) / 100;
        const discountedPrice = book.price - discountAmount;
        const totalPrice = discountedPrice * quantity;
        return totalPrice;
    }
    return book.price * quantity;
}
module.exports = calculateTotalPrice;

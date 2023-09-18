function calculateTotalPrice(book, discounts, bookId, quantity) {
    // const book = books.find((b) => b._id === bookId);
    // if (!book) return 0;
    // console.log('hhhhhhhhhhhhh', discounts);

    const discount = discounts.find((d) => d.bookIds.includes(bookId));
    console.log('hhhh', discount);
    if (!discount) return book.price * quantity;

    const discountedPrice = book.discount_price || book.price;
    const totalPrice = discountedPrice * quantity;
    const discountAmount = book.price * quantity - totalPrice;
    const discountPercentage = discount.discountPercentage;
    // console.log(
    //     'gggg',
    //     totalPrice - discountAmount * (discountPercentage / 100)
    // );
    return totalPrice - discountAmount * (discountPercentage / 100);
}
module.exports = calculateTotalPrice;

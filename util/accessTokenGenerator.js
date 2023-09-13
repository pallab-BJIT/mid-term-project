const dotEnv = require('dotenv');
dotEnv.config();
const jwt = require('jsonwebtoken');

const generateAccessToken = (body) => {
    console.log({ body });
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const token = jwt.sign(body, accessTokenSecret, { expiresIn: '1 h' });
    return token;
};

module.exports = generateAccessToken;

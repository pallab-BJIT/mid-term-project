const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

const dotEnv = require('dotenv');
const { sendResponse } = require('./util/response');
const HTTP_STATUS = require('./constants/statusCode');
dotEnv.config();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

//! Invalid json handler
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON' });
    }
    next();
});

app.get('/', (req, res) => {
    return sendResponse(res, HTTP_STATUS.OK, 'This is the base route');
});
app.use((req, res, next) => {
    return sendResponse(res, HTTP_STATUS.BAD_GATEWAY, "Can't find the route");
});

app.listen(8000, () => {
    console.log('Server started');
});

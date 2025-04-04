const userModel = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const blackListTokenModel = require('../model/blacklistToken');


module.exports.authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: true, message: 'Unauthorized' });
        }

        const isBlacklisted = await blackListTokenModel.findOne({ token: token });

        if (isBlacklisted) {
            return res.status(401).json({ error: true, message: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id)

        req.user = user;

        return next();

    } catch (err) {
        console.log(err);
        return res.status(401).json({ error: true, message: error.message });
    }
}

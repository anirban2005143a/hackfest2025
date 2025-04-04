const userModel = require('../model/userModel');
const userService = require('../services/userService');
const { validationResult } = require('express-validator');
const blackListTokenModel = require('../model/blacklistToken');

module.exports.registerUser = async (req, res, next) => {

    const errors = validationResult(req);
    try {

        if (!errors.isEmpty()) {
            return res.status(400).json({ error: true, validation: errors.array(), message: errors.array()[0].msg });
        }

        const { fullname, email, password } = req.body;

        const isUserAlready = await userModel.findOne({ email });

        if (isUserAlready) {
            return res.status(400).json({ error: true, message: 'User already exist' });
        }

        const hashedPassword = await userModel.hashPassword(password);

        const user = await userService.createUser({
            firstname: fullname.firstname,
            lastname: fullname.lastname,
            email,
            password: hashedPassword
        });

        const token = user.generateAuthToken();

        res.cookie('token', token);

        res.status(201).json({ token, message: 'User created successfully' });

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: true, message: error.message });
    }

}

module.exports.loginUser = async (req, res, next) => {

    const errors = validationResult(req);

    try {

        if (!errors.isEmpty()) {
            return res.status(400).json({ error: true, validation: errors.array(), message: errors.array()[0].msg });
        }

        const { email, password } = req.body;

        const user = await userModel.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // console.log(user.password)
        const isMatch = await user.comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = user.generateAuthToken();

        res.cookie('token', token);

        res.status(200).json({ token, message: 'Logged in successfully' });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: true, message: error.message });
    }
}

module.exports.getUserProfile = async (req, res, next) => {

    res.status(200).json(req.user);

}

module.exports.logoutUser = async (req, res, next) => {
    try {
        res.clearCookie('token');
        const token = req.cookies.token || req.headers.authorization.split(' ')[1];

        await blackListTokenModel.create({ token });

        res.status(200).json({ message: 'Logged out' });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: true, message: error.message })
    }


}
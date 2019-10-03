const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

const isAuth = async (req, res, next) => {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
        return res.status(401).json({
            error: ['You are not authorized']
        });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            error: ['Token is required']
        });
    }

    try {
        jwt.verify(token, process.env.TOKEN_KEY);
    } catch (e) {
        return res.status(401).json({
            error: [e.message]
        });
    }

    const user = await User.findOne({token: token});

    if (!user) {
        return res.status(404).json({
            error: ['User not found']
        });
    }

    req.user = user;

    next();
}

module.exports = isAuth;

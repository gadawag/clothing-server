const jwt = require('jsonwebtoken');
const Admin = require('../models/AdminModel');

const isAdmin = async (req, res, next) => {
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

    const admin = await Admin.findOne({token: token});

    if (!admin) {
        return res.status(404).json({
            error: ['Admin not found']
        });
    }

    req.admin = admin;

    next();
}

module.exports = isAdmin;

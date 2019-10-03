const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const loginSignupValidator = require('../utilities/utilities').loginSignupValidator;
const User = require('../models/UserModel');
const Admin = require('../models/AdminModel');

module.exports.signup = async (req, res, next) => {
  try {
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    const error = await loginSignupValidator(req.body, 'signup');

    if (error.length > 0) {
      return res.status(400).json({error});
    }

    const hashedPW = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = new User({email, name, password: hashedPW});

    // Generate a new token
    const token = jwt.sign({email: newUser.email}, process.env.TOKEN_KEY, {expiresIn: '1h'});

    newUser.token.push(token);

    await newUser.save();

    return res.status(201).json({token, name});

  } catch (e) {
    next(e);
  }
}

module.exports.signin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const error = await loginSignupValidator(req.body);

    if (error.length > 0) {
      return res.status(401).json({error});
    }

    // If no errors, get the user
    const user = await User.findOne({email});

    // Generate a new token
    const token = jwt.sign({email: user.email}, process.env.TOKEN_KEY, {expiresIn: '1h'});

    user.token.push(token);

    await user.save();

    res.status(200).json({token, name: user.name});

  } catch(e) {
    next(e);
  }
}

module.exports.adminLogin = async (req, res, next) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const admin = await Admin.findOne({username});

    if (!admin) {
      return res.status(401).json({
        error: ['User not found']
      });
    }

    const correctPW = await bcrypt.compare(password, admin.password);

    if (!correctPW) {
      return res.status(401).json({
        error: ['User not found']
      });
    }

    const token = jwt.sign({email: admin.email}, process.env.TOKEN_KEY, {expiresIn: '1h'});

    admin.token.push(token);

    await admin.save();

    res.status(200).json({token, name: admin.name});
  } catch (e) {
    next(e);
  }
}

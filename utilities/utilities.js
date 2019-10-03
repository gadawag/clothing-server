const validator = require('validator');
const bcrypt = require('bcrypt');
const User = require('../models/UserModel');

module.exports.loginSignupValidator = async (obj, type = 'login') => {
  const error = [];

  if (!validator.isEmail(obj.email)) {
    error.push('Invalid email');
  }

  if (!validator.isLength(obj.password, {min: 6})) {
    error.push('Password is too short');
  }

  if (type === 'login') {

    const user = await User.findOne({email: obj.email});

    if (!user) {
      error.push('Wrong email or password');
    } else {
      let correctPW = await bcrypt.compare(obj.password, user.password);

      if (!correctPW) {
        error.push('Wrong email or password');
      }
    }

  } else if (type === 'signup') {

    if (!validator.equals(obj.password, obj.confirm)) {
        error.push('Password does not matched');
    }

    if (!validator.isLength(obj.name, {min: 2})) {
      error.push('Name is required');
    }

    const user = await User.findOne({email: obj.email});

    if (user) {
      error.push('Email already exists');
    }

  }

  return error;
}

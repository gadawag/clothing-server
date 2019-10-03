const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  // cart will be an array of object because we didn't use validators like type or required in [] and {}
  // but we did specify the type of productId and quantoty of the object in that array
  cart: [{
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }],
  token: [{
    type: String
  }]
}, {timestamps: true});

const User = mongoose.model('User', userSchema);

module.exports = User;

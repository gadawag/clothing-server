const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stripeOrderId: {
    type: String,
    required: true
  },
  order: [{
    productName: {
      type: String,
      required: true
    },
    productPrice: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  }
}, {timestamps: true});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

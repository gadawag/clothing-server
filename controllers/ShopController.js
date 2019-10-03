const User = require('../models/UserModel');
const Product = require('../models/ProductModel');
const Order = require('../models/OrderModel');
const stripe = require('stripe')('sk_test_MOLZDcMWoZRxq6NuPB2qkiGx00AwwuY6JL');

module.exports.saveCart = async (req, res, next) => {
  try {
    let cart = JSON.parse(req.body.cart);
    let isValid = true;

    // Check if each product in cart is valid
    for (const p of cart) {
      const product = await Product.findOne({_id: p.productId});
      if (!product || isNaN(p.quantity) || p.quantity < 1) {
        isValid = false;
        break;
      }
    }

    if (!isValid) {
      return res.status(400).json({error: ['Cart not saved because of malicious data']})
    }

    // I use this to make sure we only save the productId and quantity in our db incase a user tries to add some additional property
    req.user.cart = cart.map(c => {
      return {
        productId: c.productId,
        quantity: c.quantity
      }
    });
    await req.user.save();

    res.status(200).json({message: 'Cart successfully saved'});

  } catch (e) {
    next(e);
  }
}

module.exports.getCart = async (req, res, next) => {
  try {
    // Prepare the Cart and i need to executePopulate here because req.user is done executing and we didnt execute populate there
    const cart = await req.user.populate('cart.productId').execPopulate();

    res.status(200).json({cart: cart.cart});
  } catch (e) {
    next();
  }
}

module.exports.addToCart = async (req, res, next) => {
  try {
    const productId = req.body.productId;

    // Check if product is legit
    const product = await Product.findOne({_id: productId});
    if (!product) {
      return res.status(404).json({
        error: ['Product not found']
      });
    }

    // Check if product already exists in user's cart
    const index = req.user.cart.findIndex(p => JSON.stringify(p.productId) === JSON.stringify(productId));

    if (index < 0) {
        req.user.cart.push({
          productId: productId,
          quantity: 1
        });
    } else {
      req.user.cart[index].quantity += 1;
    }

    await req.user.save();

    return res.status(201).json({message: 'Ok'});

  } catch (e) {
    next(e);
  }
}

module.exports.lessToCart = async (req, res, next) => {
  try {
    const productId = req.body.productId;
    const index = req.user.cart.findIndex(p => JSON.stringify(p.productId) === JSON.stringify(productId));

    if (index < 0) {
      return res.status(404).json({
        error: ['Product not found']
      });
    }

    let newCart = req.user.cart;
    if (req.user.cart[index].quantity === 1) {
      newCart = req.user.cart.filter(p => JSON.stringify(p.productId) !== JSON.stringify(productId));
    } else {
      newCart[index].quantity -= 1;
    }

    req.user.cart = newCart;
    await req.user.save();

    return res.status(200).json({message: 'Ok'});
  } catch (e) {
    next(e);
  }
}

module.exports.removeToCart = async (req, res, next) => {
  try {
    const productId = req.body.productId;
    const index = req.user.cart.findIndex(p => JSON.stringify(p.productId) === JSON.stringify(productId));

    if (index < 0) {
      return res.status(404).json({
        error: ['Product not found']
      });
    }

    const newCart = req.user.cart.filter(p => JSON.stringify(p.productId) !== JSON.stringify(productId));
    req.user.cart = newCart;
    await req.user.save();

    return res.status(200).json({message: 'Ok'});

  } catch (e) {
    next(e);
  }
}

module.exports.chargeUser = async (req, res, next) => {
  try {
    // Calculate the total amount and get the products for order model
    let totalAmount = 0;
    const records = await req.user.populate('cart.productId').execPopulate();
    const productHistory = [];
    records.cart.forEach(p => {
      totalAmount += parseFloat(p.productId.price) * p.quantity;
      productHistory.push({
        productName: p.productId.title,
        productPrice: parseFloat(p.productId.price),
        quantity: p.quantity
      });
    });

    totalAmount = parseFloat(totalAmount.toFixed(2));

    // Charge the user
    let createResponse = await stripe.charges.create({
      amount: totalAmount * 100,
      currency: "usd",
      description: "Clothing Project",
      source: req.body.tokenId
    });

    if (createResponse.status === 'succeeded') {
      // Save order history
      const newOrder = new Order({
        userId: req.user,
        stripeOrderId: createResponse.id,
        totalAmount
      });
      newOrder.order = productHistory;
      await newOrder.save();

      // Delete the user's Cart
      req.user.cart = [];
      await req.user.save();
    }

    return res.status(200).json({message: 'Ok'});
  } catch (e) {
    next(e);
  }
}

module.exports.getOrderHistory = async (req, res, next) => {
  try {
    const orderHistory = await Order.find({userId: req.user._id});

    if (orderHistory.length < 1) {
      return res.status(404).json({
        error: ['No order history']
      });
    }

    return res.status(200).json({order: orderHistory});
  } catch (e) {
    next(e);
  }
}

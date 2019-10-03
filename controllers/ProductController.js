const fs = require('fs');
const validator = require('validator');
const slugify = require('slugify');
const Category = require('../models/CategoryModel');
const Product = require('../models/ProductModel');

const fieldChecker = (obj) => {
  let error = 0;
  if (obj.title === '' || obj.categoryId === '' || obj.price === '' || obj.description === '') {
    if (obj.image) {
      fs.unlinkSync(obj.image.path);
    }
    error = 1;
  }
  return error;
}

const priceValidator = (price, image) => {
  let error = 0;
  if (isNaN(price)) {
    if (image) {
      fs.unlinkSync(image.path);
    }
    error = 1;
  }
  return error;
}

const categoryFinder = async (categoryId, image) => {
  const category = await Category.findOne({_id: categoryId});
  if (!category) {
    if (image) {
      fs.unlinkSync(image.path);
    }
  }
  return category;
}

const titleChecker = async (title, productId = null) => {
  let result;
  if (productId) {
    result = await Product.find({$and: [{title: title}, {_id: {$ne: productId}}]});
  } else {
    result = await Product.find({title: title});
  }

  if (result.length > 0) {
    return true;
  }
  return false;
}

module.exports.saveProduct = async (req, res, next) => {
  try {
    const title = req.body.title;
    const categoryId = req.body.category;
    const price = req.body.price;
    const description = req.body.description;
    const image = req.file;

    if (fieldChecker({title, categoryId, price, description, image})) {
      return res.status(400).json({
        error: ['Please complete all fields']
      });
    }

    if (priceValidator(price, image)) {
      return res.status(400).json({
        error: ['Invalid price']
      });
    }

    if (!image) {
      return res.status(400).json({
        error: ['File is empty/invalid']
      });
    }

    const productExist = await titleChecker(title);
    if (productExist) {
      fs.unlinkSync(image.path);

      return res.status(400).json({
        error: ['Product already exists']
      });
    }

    const isCategory = await categoryFinder(categoryId, image);
    if (!isCategory) {
      return res.status(400).json({
        error: ['Please select a product category']
      });
    }

    const newProduct = new Product({
      title,
      slug: slugify(title, {
        replacement: '-',
        remove: /[*+~.()'"!:@]/g,
        lower: true
      }),
      price: parseFloat(price.toLocaleString()),
      image: image.path,
      description,
      categoryId: isCategory
    });

    await newProduct.save();

    res.status(200).json({message: 'Product created successfully'});
  } catch (e) {
    next(e);
  }
}

module.exports.getAdminProduct = async (req, res, next) => {
  try {
    const product = await Product.find({}).populate('categoryId');

    if (product.length < 1) {
      return res.status(404).json({
        error: ['No product found']
      });
    }

    res.status(200).json({product});

  } catch (e) {
    next(e);
  }
}

module.exports.updateProduct = async (req, res, next) => {
  try {
    const title = req.body.title;
    const categoryId = req.body.category;
    const price = req.body.price;
    const description = req.body.description;
    const image = req.file;
    const productId = req.body.productId;

    if (fieldChecker({title, categoryId, price, description, image})) {
      return res.status(400).json({
        error: ['Please complete all fields']
      });
    }

    if (priceValidator(price, image)) {
      return res.status(400).json({
        error: ['Invalid price']
      });
    }

    const isCategory = await categoryFinder(categoryId, image);
    if (!isCategory) {
      return res.status(400).json({
        error: ['Please select a product category']
      });
    }

    const productExist = await titleChecker(title, productId);
    if (productExist) {
      if (image) {
        fs.unlinkSync(image.path);
      }

      return res.status(400).json({
        error: ['Product already exists']
      });
    }

    const product = await Product.findOne({_id: productId});
    if (!product) {
      if (image) {
        fs.unlinkSync(image.path);
      }

      return res.status(404).json({
        error: ['Product not found']
      });
    }

    if (image) {
      fs.unlinkSync(product.image);
      product.image = image.path;
    }

    product.title = title;
    product.slug = slugify(title, {
      replacement: '-',
      remove: /[*+~.()'"!:@]/g,
      lower: true
    });
    product.price = price;
    product.description = description;
    product.categoryId = isCategory;

    await product.save();

    return res.status(200).json({message: 'Product updated successfully'});
  } catch (e) {
    next(e);
  }
}

module.exports.getProductByCategory = async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const category = await Category.findOne({slug}).select('title');

    if (!category) {
      return res.status(404).json({
        error: ['Category not found']
      });
    }

    const product = await Product.find({categoryId: category._id});

    if (product.length < 1) {
      return res.status(404).json({
        error: ['No product was found']
      });
    }

    return res.status(200).json({
      category: category.title,
      product
    });

  } catch (e) {
    next(e);
  }
}

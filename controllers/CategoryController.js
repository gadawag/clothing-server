const fs = require('fs');
const slugify = require('slugify');
const Category = require('../models/CategoryModel');

const categoryChecker = async (category, categoryId = null) => {
  let result;
  if (categoryId) {
    result = await Category.find({$and: [{title: category}, {_id: {$ne: categoryId}}]});
  } else {
    result = await Category.find({title: category});
  }

  if (result.length > 0) {
    return true;
  }
  return false;
}

module.exports.createCategory = async (req, res, next) => {
  try {
    const title = req.body.title;
    const image = req.file;

    // If req.file is undefined it has to be empty / invalid file extension / etc...
    if (!image) {
      return res.status(400).json({error: ['File is empty/invalid']});
    }

    if (!title) {
      // remove the uploaded file
      fs.unlinkSync(image.path);

      return res.status(400).json({error: ['Title is required']});
    }

    const categoryExists = await categoryChecker(title);
    if (categoryExists) {
      // remove the uploaded file
      fs.unlinkSync(image.path);

      return res.status(400).json({
        error: ['Category already exists']
      });
    }

    const category = new Category({
      title,
      slug: slugify(title, {
        replacement: '-',
        remove: /[*+~.()'"!:@]/g,
        lower: true
      }),
      image: image.path
    });

    await category.save();

    res.status('200').json({message: 'Category created successfully'});
  } catch (e) {
    next(e);
  }
}

module.exports.getAdminCategory = async (req, res, next) => {
  try {
    const categories = await Category.find({});

    if (categories.length < 1) {
      return res.status(404).json({
        error: ['No categories found']
      });
    }

    res.status(200).json({categories});

  } catch (e) {
    next(e);
  }
}

module.exports.updateCategory = async (req, res, next) => {
  try {
    const image = req.file;
    const title = req.body.title;
    const category = await Category.findOne({_id: req.body.categoryId});

    if (!category) {
      return res.status(404).json({
        error: ['Category not found']
      });
    }

    if (title === '') {
      if (image) { // If title is empty and user provided an image
        fs.unlinkSync(image.path);
      }

      return res.status(400).json({
        error: ['Title is required']
      });
    }

    const categoryExists = await categoryChecker(title, req.body.categoryId);
    if (categoryExists) {
      if (image) {
        fs.unlinkSync(image.path);
      }

      return res.status(400).json({
        error: ['Category already exists']
      });
    }

    // User uploaded new
    if (image) {
      fs.unlinkSync(category.image);
      category.image = image.path;
    }

    category.title = title;
    category.slug = slugify(title, {
      replacement: '-',
      remove: /[*+~.()'"!:@]/g,
      lower: true
    });
    await category.save();

    res.status(200).json({message: 'Category updated successfully'});
  } catch (e) {
    next(e);
  }
}

module.exports.getCategories = async (req, res, next) => {
  try {
    const category = await Category.find({}).select('title slug image');

    if (category.length < 1) {
      return res.status(404).json({
        error: ['No category']
      });
    }

    res.status(200).json({category});

  } catch (e) {
    next(e);
  }
}

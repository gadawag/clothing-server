const multer = require('multer');
const myMulter = require('../utilities/multer');

module.exports.multerCategory = (req, res, next) => {
    myMulter.multerCategory(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading. e.g file too large
          return res.status(400).json({error: [err.message]});
        }
        next();
    });
};

module.exports.multerProduct = (req, res, next) => {
    myMulter.multerProduct(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading. e.g file too large
          return res.status(400).json({error: [err.message]});
        }
        next();
    });
};

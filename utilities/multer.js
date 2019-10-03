const multer = require('multer');

// Category image
const fileStorageCategory = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/category');
    },
    filename: (req, file, cb) => {
        const trimmedName = file.originalname
                                .replace(' ', '')
                                .replace('(', '')
                                .replace(')', '')
                                .replace(':', '');

        cb(null, Date.now() + '-' + trimmedName);
    }
});

const fileFilterCategory = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

module.exports.multerCategory = multer({
    storage: fileStorageCategory,
    fileFilter: fileFilterCategory,
    limits: {fileSize: 1048576} // 1mb
}).single('categoryImage');


// Product image
const fileStorageProduct = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/product');
    },
    filename: (req, file, cb) => {
        const trimmedName = file.originalname
                                .replace(' ', '')
                                .replace('(', '')
                                .replace(')', '')
                                .replace(':', '');

        cb(null, Date.now() + '-' + trimmedName);
    }
});

const fileFilterProduct = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

module.exports.multerProduct = multer({
    storage: fileStorageProduct,
    fileFilter: fileFilterProduct,
    limits: {fileSize: 1048576} // 1mb
}).single('productImage');

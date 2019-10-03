const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const AuthRouter = require('./routers/AuthRouter');
const CategoryRouter = require('./routers/CategoryRouter');
const ProductRouter = require('./routers/ProductRouter');
const ShopRouter = require('./routers/ShopRouter');
const Admin = require('./models/AdminModel');
const app = express();

// Enable cross origin resource sharing to all. Read docs: https://www.npmjs.com/package/cors
app.use(cors());

// To process JSON and x-www-form-urlencoded request. But if the request is multipart-formdata it will automatically parsed
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static file serving
app.use('/images/category', express.static(path.join(__dirname, 'images', 'category')));
app.use('/images/product', express.static(path.join(__dirname, 'images', 'product')));

// Note: Multer file uplaoad is in middleware folder. We use it only for specific routes, not on every request

// Routes
app.use(AuthRouter);
app.use(CategoryRouter);
app.use(ProductRouter);
app.use(ShopRouter);
app.all('*', (req, res, next) => {
  res.status(404).json({error: ['Endpoint not found']});
});


// Global error handler
app.use((error, req, res, next) => {
  console.log(error); // changed this to log files error
  res.status(500).json({error: [error.message]});
  // next(); // we should call next if we have a next global error handler
});

// Initialize the app
const init = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true});

    const admin = await Admin.find({});

    if (admin.length < 1) {
        const password = await bcrypt.hash('123456', 12);
        const newAdmin = new Admin({
          username: 'gadawag',
          name: 'Gab',
          password
        });
        await newAdmin.save();
    }

    app.listen(process.env.PORT || 8080, () => {
      console.log('Server is ready to handle request.');
    });
  } catch (e) {
    console.log(e);
  }
}

(async () => {
  try {await init()} catch(e) {console.log(e)}
})();

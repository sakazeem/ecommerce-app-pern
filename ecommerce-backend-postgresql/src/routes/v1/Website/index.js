const express = require('express');
const parentCategoryRoute = require('./parentCategoryRoute');
const categoryRoute = require('./categoryRoute');
const productRoute = require('./productRoute');
const authRoute = require('./authRoute');
const languageRoute = require('./languageRoute');
const cartRoute = require('./cartRoute');
const favouriteRoute = require('./favouriteRoute');
const activityRoute = require('./activityRoute');

const websiteRouter = express.Router();

websiteRouter.use('/parent-category', parentCategoryRoute);
websiteRouter.use('/category', categoryRoute);
websiteRouter.use('/product', productRoute);
websiteRouter.use('/products', productRoute);
websiteRouter.use('/auth', authRoute);
websiteRouter.use('/language', languageRoute);
websiteRouter.use('/homepage-sections', require('./homepageSectionsRoute'));
websiteRouter.use('/metadata', require('./metadataRoute'));
websiteRouter.use('/order', require('./orderRoute'));
websiteRouter.use('/review', require('./reviewRoute'));
websiteRouter.use('/profile', require('./profileRoute'));
websiteRouter.use('/returned', require('./returnedRoute'));
websiteRouter.use('/subscriber', require('./subscriberRoute'));
websiteRouter.use('/cart', cartRoute);
websiteRouter.use('/favourites', favouriteRoute);
websiteRouter.use('/activity', activityRoute);

module.exports = websiteRouter;

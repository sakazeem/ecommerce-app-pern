const express = require('express');
const authRoute = require('./authRoute');
const parentCategoryRoute = require('./parentCategoryRoute');
const categoryRoute = require('./categoryRoute');
const uspRoute = require('./uspRoute');
const brandRoute = require('./brandRoute');
const mediaRoute = require('./mediaRoute');
const branchRoute = require('./branchRoute');
const vendorRoute = require('./vendorRoute');
const productRoute = require('./productRoute');
const settingRoute = require('./settingRoute');
const languageRoute = require('./languageRoute');
const attributeRoute = require('./attributeRoute');
const sizeChartRoute = require('./sizeChartRoute');
const scriptRoute = require('./scriptRoute');
const homepageSectionsRoute = require('./homepageSectionsRoute');
const { imageService } = require('../../../services');

const adminRouter = express.Router();

adminRouter.use('/auth', authRoute);
adminRouter.use('/parent-category', parentCategoryRoute);
adminRouter.use('/category', categoryRoute);
adminRouter.use('/usp', uspRoute);
adminRouter.use('/brand', brandRoute);
adminRouter.use('/homepage-sections', homepageSectionsRoute);
adminRouter.use('/branch', branchRoute);
adminRouter.use('/vendor', vendorRoute);
adminRouter.use('/product', productRoute);
adminRouter.use('/setting', settingRoute);
adminRouter.use('/language', languageRoute);
adminRouter.use('/media', mediaRoute);
adminRouter.use('/attribute', attributeRoute);
adminRouter.use('/sizeChart', sizeChartRoute);
adminRouter.use('/script', scriptRoute);
adminRouter.use('/order', require('./orderRoute'));
adminRouter.use('/returned', require('./returnedRoute'));
adminRouter.use('/subscriber', require('./subscriberRoute'));
adminRouter.use('/appuser', require('./appUserRoute'));
adminRouter.use('/user', require('./userRoute'));
adminRouter.use('/role', require('./roleRoute'));
adminRouter.use('/permission', require('./permissionRoute'));
adminRouter.use('/dashboard', require('./dashboardRoute'));
adminRouter.use('/move-to-r2', (req, res) => {
	imageService.migrate();
	res.send({ message: 'Migration started' });
});

module.exports = adminRouter;

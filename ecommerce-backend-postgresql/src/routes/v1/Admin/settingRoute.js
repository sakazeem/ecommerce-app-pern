const express = require('express');
const { adminSettingController } = require('../../../controllers/Admin');
const { adminSettingValidation } = require('../../../validations/Admin');
const validate = require('../../../middlewares/validate');

const router = express.Router();

// ─── Global Setting ─────────────────────────────────────────────────────────
router.post('/global/add', adminSettingController.addGlobalSetting);
router.get('/global/all', adminSettingController.getGlobalSetting);
router.put('/global/update', adminSettingController.updateGlobalSetting);

// ─── Store Setting ───────────────────────────────────────────────────────────
router.post('/store-setting/add', adminSettingController.addStoreSetting);
router.get('/store-setting/all', adminSettingController.getStoreSetting);
router.get('/store-setting/seo', adminSettingController.getStoreSeoSetting);
router.put('/store-setting/update', adminSettingController.updateStoreSetting);

// ─── Store Customization Setting ─────────────────────────────────────────────
router.post('/store/customization/add', adminSettingController.addStoreCustomizationSetting);
router.get('/store/customization/all', adminSettingController.getStoreCustomizationSetting);
router.put('/store/customization/update', adminSettingController.updateStoreCustomizationSetting);

// ─── Brand / Identity / SEO Setting ─────────────────────────────────────────
router.get('/brand/all', adminSettingController.getBrandSetting);
router.put(
	'/brand/update',
	validate(adminSettingValidation.updateBrandSetting),
	adminSettingController.updateBrandSetting
);

module.exports = router;
